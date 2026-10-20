const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/product");
const Customer = require("../models/Customer");
const InventoryMovement = require("../models/InventoryMovement");
const Settings = require("../models/Settings");
const ApprovalRequest = require("../models/ApprovalRequest");
const AuditLog = require("../models/AuditLog");
const { authenticate, optionalAuth, requireStaff, requireManagerOrOwner } = require("../middleware/auth");

// GET next invoice number
router.get("/next-invoice", async (req, res) => {
  try {
    const count = await Sale.countDocuments();
    const year = new Date().getFullYear();
    const nextNumber = count + 1;
    const invoiceNumber = `RNJ-${year}-${String(nextNumber).padStart(4, "0")}`;
    res.json({ success: true, invoiceNumber, nextInvoiceNumber: invoiceNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all sales
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { startDate, endDate, customerId, status } = req.query;
    let query = {};

    if (status) query.status = status;
    if (customerId) query["customer.customerId"] = customerId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query).sort({ date: -1 });

    const formatted = sales.map((s) => ({
      id: s._id.toString(),
      _id: s._id.toString(),
      invoiceNumber: s.invoiceNumber,
      date: s.date,
      customer: s.customer,
      items: s.items,
      calculation: s.calculation,
      payments: s.payments,
      cashier: s.cashier,
      register: s.register,
      notes: s.notes,
      status: s.status,
      refundDetails: s.refundDetails,
      correctionHistory: s.correctionHistory,
      createdAt: s.createdAt
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single sale
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    let sale = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      sale = await Sale.findById(req.params.id);
    }
    if (!sale) {
      sale = await Sale.findOne({ invoiceNumber: req.params.id });
    }

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale invoice not found" });
    }

    res.json({
      success: true,
      data: {
        id: sale._id.toString(),
        _id: sale._id.toString(),
        ...sale.toObject()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST record sale with atomic stock deduction, discount authority check, and customer link
router.post("/", optionalAuth, async (req, res) => {
  try {
    // RBAC: If user is authenticated, disallow inventory-only staff and customers from billing
    if (req.user && ['customer', 'user', 'inventory'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role [${req.user.role}] is not authorized to create counter sales invoices.`
      });
    }

    const {
      invoiceNumber: reqInvoiceNum,
      cashier: customCashier,
      register,
      notes,
      approvalCode,
      approvalId
    } = req.body;

    const rawItems = req.body.items || [];
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Sale must include at least one garment or accessory"
      });
    }

    // Normalize customer
    const customer = req.body.customer || {
      name: req.body.customerName || "Walk-in Customer",
      phone: req.body.customerPhone || "",
      email: req.body.customerEmail || "",
      city: req.body.customerCity || "Udaipur",
      address: req.body.customerAddress || ""
    };

    // Normalize items
    const items = rawItems.map((item) => {
      const unitPrice = Number(item.unitPrice != null ? item.unitPrice : item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const total = Number(item.total != null ? item.total : unitPrice * quantity) || 0;
      const mode = item.mode || (item.type === "rent" || item.orderType === "rent" ? "rent" : "buy");
      return {
        productId: item.productId || item.id || undefined,
        name: item.name || item.productName || "Royal Garment",
        sku: item.sku || "",
        mode,
        size: item.size || item.selectedSize || "Standard",
        unitPrice,
        quantity,
        discount: Number(item.discount) || 0,
        taxableAmount: Number(item.taxableAmount != null ? item.taxableAmount : total),
        taxAmount: Number(item.taxAmount) || 0,
        total
      };
    });

    // Normalize calculation
    let calculation = req.body.calculation;
    if (!calculation || calculation.grandTotal == null) {
      const grandTotal = Number(req.body.total != null ? req.body.total : (req.body.grandTotal != null ? req.body.grandTotal : req.body.subtotal)) || items.reduce((s, it) => s + it.total, 0);
      const subtotal = Number(req.body.subtotal != null ? req.body.subtotal : grandTotal);
      const totalTax = Number(req.body.gstAmount != null ? req.body.gstAmount : req.body.taxAmount) || 0;
      calculation = {
        subtotal,
        itemDiscounts: Number(req.body.discount) || 0,
        specialDiscount: 0,
        taxableAmount: subtotal,
        cgst: totalTax / 2,
        sgst: totalTax / 2,
        igst: 0,
        totalTax,
        roundOff: 0,
        grandTotal,
        paidAmount: Number(req.body.amountPaid != null ? req.body.amountPaid : grandTotal),
        balanceRemaining: 0
      };
    }

    // DISCOUNT THRESHOLD & CASHIER PERMISSION ENFORCEMENT
    let totalDiscount =
      (Number(calculation.itemDiscounts) || 0) +
      (Number(calculation.specialDiscount) || 0) +
      (Number(calculation.discountAmount) || 0) +
      (Number(calculation.discount) || 0) +
      (Number(req.body.discountAmount) || 0) +
      (Number(req.body.discount) || 0);

    const subtotal = Number(calculation.subtotal) || items.reduce((s, it) => s + (it.unitPrice * it.quantity), 0);
    let discountPercent = Number(calculation.discountPercent) || (subtotal > 0 ? (totalDiscount / subtotal) * 100 : 0);
    if (totalDiscount === 0 && discountPercent > 0 && subtotal > 0) {
      totalDiscount = (discountPercent / 100) * subtotal;
    }

    const settings = (await Settings.findOne()) || {};
    const maxPercent = settings.maxCashierDiscountPercent != null ? settings.maxCashierDiscountPercent : 10;
    const maxAmount = settings.maxCashierDiscountAmount != null ? settings.maxCashierDiscountAmount : 2000;

    const userRole = req.user?.role || "cashier";
    const isOwnerOrManager = ["owner", "admin", "manager"].includes(userRole);

    if (!isOwnerOrManager && totalDiscount > 0) {
      if (discountPercent > maxPercent || totalDiscount > maxAmount) {
        // High-risk discount requires approval verification
        let verifiedApproval = null;

        if (approvalCode) {
          verifiedApproval = await ApprovalRequest.findOne({
            approvalCode: approvalCode.trim(),
            status: "APPROVED",
            action: "LARGE_DISCOUNT"
          });
        } else if (approvalId) {
          verifiedApproval = await ApprovalRequest.findOne({
            _id: approvalId,
            status: "APPROVED",
            action: "LARGE_DISCOUNT"
          });
        }

        if (!verifiedApproval) {
          await AuditLog.record({
            actor: req.user,
            action: "UNAUTHORIZED_DISCOUNT_ATTEMPT",
            target: { entity: "Sale", label: `Discount ₹${totalDiscount} (${discountPercent.toFixed(1)}%)` },
            details: { totalDiscount, discountPercent, maxAmount, maxPercent },
            ip: req.ip,
            severity: "WARNING"
          });

          return res.status(403).json({
            success: false,
            message: `Discount of ₹${totalDiscount.toFixed(2)} (${discountPercent.toFixed(1)}%) exceeds Cashier authority limit (max ${maxPercent}% or ₹${maxAmount}). Manager or Owner approval is required.`
          });
        }

        // Mark approval as executed
        verifiedApproval.status = "EXECUTED";
        verifiedApproval.executedAt = new Date();
        await verifiedApproval.save();
      }
    }

    // Normalize payments
    let payments = req.body.payments;
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      payments = [
        {
          method: (req.body.paymentMethod || "CASH").toUpperCase(),
          amount: calculation.grandTotal,
          status: (req.body.paymentStatus || "PAID").toUpperCase(),
          timestamp: new Date()
        }
      ];
    }

    // Generate or verify invoice number
    let invoiceNumber = reqInvoiceNum;
    if (!invoiceNumber) {
      const count = await Sale.countDocuments();
      const year = new Date().getFullYear();
      invoiceNumber = `RNJ-${year}-${String(count + 1).padStart(4, "0")}`;
    }

    // Ensure unique invoice number
    let existingSale = await Sale.findOne({ invoiceNumber });
    if (existingSale) {
      invoiceNumber = `RNJ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }

    const cashierName = req.user ? req.user.name : (customCashier || "Showroom Staff");

    // Deduct stock in Product collection and log movements
    const movements = [];
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      let product = null;

      const prodIdStr = item.productId ? item.productId.toString() : "";
      if (prodIdStr && /^[0-9a-fA-F]{24}$/.test(prodIdStr)) {
        product = await Product.findById(prodIdStr);
      }
      if (!product && item.name) {
        product = await Product.findOne({ name: item.name });
      }

      if (product) {
        const currentStock = Number(product.stock) || 0;
        const newStock = Math.max(0, currentStock - qty);
        product.stock = newStock;
        await product.save();

        movements.push({
          productId: product._id,
          productName: product.name,
          sku: item.sku || product.sku || `RNJ-SKU-${product._id}`,
          change: -qty,
          balance: newStock,
          type: item.mode === "rent" ? "RENTAL_OUT" : "SALE",
          reference: `Invoice #${invoiceNumber}`,
          actor: cashierName
        });
      }
    }

    if (movements.length > 0) {
      await InventoryMovement.insertMany(movements);
    }

    // Link or update Customer in database
    let customerRef = customer || {};
    if (customer?.phone) {
      const cleanPhone = customer.phone.trim();
      let customerDoc = await Customer.findOne({ phone: cleanPhone });
      const saleTotal = calculation?.grandTotal || 0;

      if (customerDoc) {
        customerDoc.totalSpent = (customerDoc.totalSpent || 0) + saleTotal;
        customerDoc.ordersCount = (customerDoc.ordersCount || 0) + 1;
        if (customer.name && customerDoc.name === "Walk-in Customer") {
          customerDoc.name = customer.name;
        }
        if (req.user) customerDoc.lastUpdatedBy = req.user._id;
        await customerDoc.save();
        customerRef = {
          customerId: customerDoc._id,
          name: customerDoc.name,
          phone: customerDoc.phone,
          email: customerDoc.email,
          city: customerDoc.city
        };
      } else if (customer.name) {
        customerDoc = await Customer.create({
          name: customer.name,
          phone: cleanPhone,
          email: customer.email || "",
          city: customer.city || "Udaipur",
          address: customer.address || "",
          totalSpent: saleTotal,
          ordersCount: 1,
          createdBy: req.user ? req.user._id : null
        });
        customerRef = {
          customerId: customerDoc._id,
          name: customerDoc.name,
          phone: customerDoc.phone,
          email: customerDoc.email,
          city: customerDoc.city
        };
      }
    }

    // Save Sale to MongoDB Atlas
    const sale = await Sale.create({
      invoiceNumber,
      date: new Date(),
      customer: customerRef,
      items,
      calculation: calculation || { grandTotal: 0 },
      payments: payments || [],
      cashier: cashierName,
      register: register || "Counter 01",
      notes: notes || "",
      status: "PAID"
    });

    // Record Audit Log
    await AuditLog.record({
      actor: req.user || { name: cashierName, role: "cashier" },
      action: "SALE_CREATED",
      target: {
        entity: "Sale",
        entityId: sale._id.toString(),
        label: `Invoice #${invoiceNumber}`
      },
      details: {
        invoiceNumber,
        grandTotal: calculation.grandTotal,
        discountApplied: totalDiscount,
        itemCount: items.length,
        customerName: customerRef.name
      },
      ip: req.ip,
      severity: totalDiscount > 0 ? "WARNING" : "INFO"
    });

    const saleData = {
      id: sale._id.toString(),
      _id: sale._id.toString(),
      ...sale.toObject()
    };

    res.status(201).json({
      success: true,
      sale: saleData,
      data: saleData
    });
  } catch (err) {
    console.error("Record sale error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST issue traceable refund / cancellation (Restricted by role)
router.post("/:id/refund", authenticate, requireStaff, async (req, res) => {
  try {
    let sale = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      sale = await Sale.findById(req.params.id);
    }
    if (!sale) {
      sale = await Sale.findOne({ invoiceNumber: req.params.id });
    }

    if (!sale) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    if (sale.status === "REFUNDED" || sale.refundDetails?.isRefunded) {
      return res.status(400).json({
        success: false,
        message: `Invoice #${sale.invoiceNumber} has already been refunded on ${new Date(sale.refundDetails.refundedAt).toLocaleDateString()}.`
      });
    }

    const { reason, amount, approvalCode, approvalId } = req.body;
    const userRole = req.user.role;
    const isOwnerOrManager = ["owner", "admin", "manager"].includes(userRole);

    // If cashier, require verified manager/owner approval
    if (!isOwnerOrManager) {
      let verifiedApproval = null;
      if (approvalCode) {
        verifiedApproval = await ApprovalRequest.findOne({
          approvalCode: approvalCode.trim(),
          status: "APPROVED",
          action: "INVOICE_REFUND"
        });
      } else if (approvalId) {
        verifiedApproval = await ApprovalRequest.findOne({
          _id: approvalId,
          status: "APPROVED",
          action: "INVOICE_REFUND"
        });
      }

      if (!verifiedApproval) {
        await AuditLog.record({
          actor: req.user,
          action: "UNAUTHORIZED_REFUND_ATTEMPT",
          target: { entity: "Sale", entityId: sale._id.toString(), label: `Invoice #${sale.invoiceNumber}` },
          details: { requestedAmount: amount || sale.calculation?.grandTotal, reason },
          ip: req.ip,
          severity: "CRITICAL"
        });

        return res.status(403).json({
          success: false,
          message: "Cashiers cannot process refunds without authorized Manager or Owner approval. Submit an approval request first."
        });
      }

      verifiedApproval.status = "EXECUTED";
      verifiedApproval.executedAt = new Date();
      await verifiedApproval.save();
    }

    const refundAmount = Number(amount) || sale.calculation?.grandTotal || 0;
    const refundReason = reason ? reason.trim() : "Showroom return & refund";

    // Set refund details on Sale
    sale.status = "REFUNDED";
    sale.refundDetails = {
      isRefunded: true,
      refundAmount,
      refundReason,
      refundedAt: new Date(),
      refundedBy: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role
      }
    };

    sale.correctionHistory.push({
      timestamp: new Date(),
      actor: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role
      },
      action: "INVOICE_REFUND",
      reason: refundReason,
      previousStatus: "PAID",
      newStatus: "REFUNDED"
    });

    await sale.save();

    // Restock returned items atomically
    const movements = [];
    for (const item of sale.items) {
      const qty = Number(item.quantity) || 1;
      let product = null;

      if (item.productId) {
        product = await Product.findById(item.productId);
      }
      if (!product && item.name) {
        product = await Product.findOne({ name: item.name });
      }

      if (product) {
        product.stock = (Number(product.stock) || 0) + qty;
        await product.save();

        movements.push({
          productId: product._id,
          productName: product.name,
          sku: item.sku || product.sku || `RNJ-SKU-${product._id}`,
          change: +qty,
          balance: product.stock,
          type: "CORRECTION",
          reference: `Refund Restock: Invoice #${sale.invoiceNumber}`,
          actor: req.user.name,
          date: new Date()
        });
      }
    }

    if (movements.length > 0) {
      await InventoryMovement.insertMany(movements);
    }

    // Deduct customer totalSpent if linked
    if (sale.customer?.customerId) {
      const custDoc = await Customer.findById(sale.customer.customerId);
      if (custDoc) {
        custDoc.totalSpent = Math.max(0, (custDoc.totalSpent || 0) - refundAmount);
        await custDoc.save();
      }
    }

    // Record high-severity audit log
    await AuditLog.record({
      actor: req.user,
      action: "INVOICE_REFUNDED",
      target: {
        entity: "Sale",
        entityId: sale._id.toString(),
        label: `Invoice #${sale.invoiceNumber}`
      },
      details: {
        invoiceNumber: sale.invoiceNumber,
        refundAmount,
        refundReason,
        itemsRestocked: movements.length
      },
      ip: req.ip,
      severity: "CRITICAL"
    });

    res.json({
      success: true,
      message: `Invoice #${sale.invoiceNumber} has been refunded and restocked. Reversal logged in audit trail.`,
      data: sale
    });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PREVENT SILENT ALTERATION OF COMPLETED INVOICES
router.put("/:id", authenticate, async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "SECURITY SAFEGUARD: Completed financial invoices cannot be silently modified or overwritten. To record returns or adjustments, use the authorized traceable refund endpoint (/api/sales/:id/refund)."
  });
});

// PREVENT DELETION OF INVOICES
router.delete("/:id", authenticate, async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "SECURITY SAFEGUARD: Completed tax invoices cannot be deleted from the database. Financial records must be preserved for tax compliance and audit history."
  });
});

module.exports = router;
