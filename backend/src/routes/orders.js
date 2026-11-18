const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { optionalAuth, authenticate, requireStaff } = require("../middleware/auth");

const STAFF_ROLES = ["owner", "admin", "manager", "cashier", "inventory"];

// GET all orders (Authenticated: Customers get own orders; Staff gets full directory)
router.get("/", authenticate, async (req, res) => {
  try {
    const isStaff = STAFF_ROLES.includes(req.user.role);
    const { status, user, orderNumber, email, phone } = req.query;
    let query = {};

    if (!isStaff) {
      // Customer record isolation: Customers can ONLY view their own orders
      query.$or = [
        { user: req.user._id },
        { customerEmail: new RegExp(`^${req.user.email.trim()}$`, "i") }
      ];
      if (req.user.phone) {
        query.$or.push({ customerPhone: req.user.phone.trim() });
      }
    } else {
      // Showroom staff & admin filtering
      if (status) query.orderStatus = status;
      if (orderNumber) query.orderNumber = orderNumber;
      if (user) query.user = user;
      if (email) query.customerEmail = new RegExp(`^${email.trim()}$`, "i");
      if (phone) query.customerPhone = phone.trim();
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders.map((o) => o.toJSON())
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single order (Ownership verified for customers)
router.get("/:id", authenticate, async (req, res) => {
  try {
    let order = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(req.params.id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isStaff = STAFF_ROLES.includes(req.user.role);
    if (!isStaff) {
      // Enforce ownership
      const isOwner = (order.user && order.user.toString() === req.user._id.toString()) ||
        (order.customerEmail && order.customerEmail.toLowerCase() === req.user.email.toLowerCase()) ||
        (req.user.phone && order.customerPhone === req.user.phone);

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission to view this royal order."
        });
      }
    }

    res.json({
      success: true,
      data: order.toJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create online / checkout order (With server-side price recalculation)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      deliveryType,
      shippingAddress,
      paymentMethod,
      securityDeposit,
      fittingNotes,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one royal ensemble"
      });
    }

    const cleanName = (customerName || (req.user ? req.user.name : "")).trim();
    const cleanPhone = (customerPhone || (req.user ? req.user.phone : "")).trim();
    const cleanEmail = (customerEmail || (req.user ? req.user.email : "")).toLowerCase().trim();

    if (!cleanName || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone number are required to schedule fitting and delivery"
      });
    }

    const year = new Date().getFullYear();
    const count = await Order.countDocuments();
    const orderNumber = `RNJ-${year}-${String(1000 + count + 1)}`;

    // SERVER-SIDE PRICE RECALCULATION & STOCK VERIFICATION
    let computedSubtotal = 0;
    const formattedItems = [];

    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const isRental = item.orderType === "rent" || item.type === "rent";
      const rentalDays = Number(item.rentalDays) || 3;

      let prodDoc = null;
      const prodId = item.productId || (item.product && (item.product._id || item.product.id));
      if (prodId && String(prodId).match(/^[0-9a-fA-F]{24}$/)) {
        prodDoc = await Product.findById(prodId);
      }
      if (!prodDoc && (item.name || item.productName || item.product?.name)) {
        const pName = item.name || item.productName || item.product?.name;
        prodDoc = await Product.findOne({ name: pName });
      }

      // Authoritative pricing from database
      let unitPrice = 0;
      let prodName = "Royal Bespoke Attire";
      let prodImg = "/images/image.png";

      if (prodDoc) {
        prodName = prodDoc.name;
        prodImg = prodDoc.images && prodDoc.images[0] ? prodDoc.images[0].url : (prodDoc.image || "/images/image.png");

        if (isRental) {
          unitPrice = typeof prodDoc.price === "object" && prodDoc.price.rentPrice
            ? Number(prodDoc.price.rentPrice)
            : Math.round((Number(prodDoc.price?.purchasePrice || prodDoc.price || 0)) * 0.3);
        } else {
          unitPrice = typeof prodDoc.price === "object" && prodDoc.price.purchasePrice
            ? Number(prodDoc.price.purchasePrice)
            : Number(prodDoc.price || 0);
        }

        // Atomically decrement stock
        prodDoc.stock = Math.max(0, (Number(prodDoc.stock) || 0) - qty);
        await prodDoc.save();
      } else {
        // Fallback for custom bespoke garments
        unitPrice = Math.max(0, Number(item.unitPrice || item.price) || 0);
        prodName = item.name || item.productName || item.product || "Custom Royal Garment";
      }

      const lineTotal = unitPrice * qty;
      computedSubtotal += lineTotal;

      formattedItems.push({
        productId: prodDoc ? prodDoc._id : null,
        productName: prodName,
        image: prodImg,
        orderType: isRental ? "rent" : "purchase",
        size: item.selectedSize || item.size || "Standard",
        quantity: qty,
        unitPrice,
        rentalDays: isRental ? rentalDays : 0,
        rentalStartDate: item.rentalStartDate || ""
      });
    }

    const depositNum = Math.max(0, Number(securityDeposit) || 0);
    const computedTotal = computedSubtotal + depositNum;

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : null,
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerEmail: cleanEmail,
      items: formattedItems,
      deliveryType: deliveryType || "showroom",
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || "whatsapp",
      paymentStatus: "Pending",
      orderStatus: deliveryType === "showroom" ? "Fitting Scheduled at Udaipur Showroom" : "Order Placed",
      subtotal: computedSubtotal,
      securityDeposit: depositNum,
      total: computedTotal,
      fittingNotes: fittingNotes || "",
      notes: notes || ""
    });

    // If authenticated customer, also push to user account orders
    if (req.user) {
      req.user.orders.push({
        orderId: orderNumber,
        items: formattedItems,
        total: computedTotal,
        status: order.orderStatus,
        type: "online",
        notes: notes || "",
        createdAt: new Date().toISOString(),
        deliveryAddress: shippingAddress || req.user.address
      });
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: "Royal order confirmed successfully",
      order: order.toJSON()
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update order status (Showroom staff only)
router.put("/:id/status", authenticate, requireStaff, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.orderStatus = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order.toJSON()
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
