const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const InventoryMovement = require("../models/InventoryMovement");
const Settings = require("../models/Settings");
const ApprovalRequest = require("../models/ApprovalRequest");
const AuditLog = require("../models/AuditLog");
const { authenticate, optionalAuth, requireStaff, requireInventoryStaff } = require("../middleware/auth");

// GET all inventory movements (Staff only)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { limit = 100, type } = req.query;
    let query = {};
    if (type) query.type = type;

    const movements = await InventoryMovement.find(query)
      .sort({ date: -1 })
      .limit(Number(limit));

    const formatted = movements.map((m) => ({
      id: m._id.toString(),
      _id: m._id.toString(),
      date: m.date,
      productName: m.productName,
      sku: m.sku,
      change: m.change,
      balance: m.balance,
      type: m.type,
      reference: m.reference,
      actor: m.actor
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

// POST adjust product stock with RBAC, write-off thresholds, and approval enforcement
router.post("/adjust", authenticate, requireInventoryStaff, async (req, res) => {
  try {
    const { productId, delta, reason = "Manual Stock Adjustment", actor, approvalCode } = req.body;

    if (!productId || delta === undefined) {
      return res.status(400).json({
        success: false,
        message: "productId and delta change are required."
      });
    }

    let product = null;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(productId);
    }
    if (!product) {
      product = await Product.findOne({ sku: productId });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const currentStock = Number(product.stock) || 0;
    const changeNum = Number(delta);
    if (isNaN(changeNum)) {
      return res.status(400).json({ success: false, message: "Delta change must be a valid number." });
    }

    // Role-based restrictions on stock adjustments / write-offs
    const staffRole = req.user?.role || "inventory";
    const settings = await Settings.findOne();
    const maxWriteOffQty = settings?.maxInventoryWriteOffQty ?? 2;
    const requireApprovalForWriteOffs = settings?.requireApprovalForWriteOffs ?? true;

    let verifiedApproval = null;

    // Check if this is a negative adjustment (Write-off / Damage / Shrinkage)
    if (changeNum < 0) {
      const writeOffQty = Math.abs(changeNum);

      // Ordinary inventory staff can only write off up to maxWriteOffQty without approval
      if (staffRole === "inventory" && requireApprovalForWriteOffs && writeOffQty > maxWriteOffQty) {
        if (!approvalCode) {
          return res.status(403).json({
            success: false,
            message: `SECURITY RESTRICTION: Stock write-off of ${writeOffQty} units exceeds the staff limit of ${maxWriteOffQty} units. Owner or Manager approval code is required.`,
            requiresApproval: true,
            maxAllowedWithoutApproval: maxWriteOffQty
          });
        }

        // Verify provided approval code
        verifiedApproval = await ApprovalRequest.findOne({
          approvalCode: approvalCode.trim().toUpperCase(),
          action: "STOCK_WRITE_OFF",
          status: "APPROVED"
        });

        if (!verifiedApproval) {
          return res.status(403).json({
            success: false,
            message: "Invalid or unapproved write-off authorization code."
          });
        }

        // Check if write-off qty matches approved details
        if (verifiedApproval.details?.units && writeOffQty > Number(verifiedApproval.details.units)) {
          return res.status(403).json({
            success: false,
            message: `Approved write-off was only for ${verifiedApproval.details.units} units. Attempted: ${writeOffQty}.`
          });
        }
      }
    }

    const newStock = Math.max(0, currentStock + changeNum);
    product.stock = newStock;
    await product.save();

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : actor || "Staff";

    const movementType = changeNum >= 0 ? "RESTOCK" : "DAMAGE";
    const movement = await InventoryMovement.create({
      productId: product._id,
      productName: product.name,
      sku: product.sku || `RNJ-SKU-${product._id}`,
      change: changeNum,
      balance: newStock,
      type: movementType,
      reference: reason,
      actor: actorName,
      date: new Date()
    });

    // Mark approval as executed if used
    if (verifiedApproval) {
      verifiedApproval.status = "EXECUTED";
      verifiedApproval.executedAt = new Date();
      verifiedApproval.executedBy = {
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email
      };
      await verifiedApproval.save();
    }

    // Record immutable audit log
    await AuditLog.record({
      actor: req.user,
      action: changeNum < 0 ? "STOCK_WRITE_OFF" : "STOCK_RESTOCKED",
      target: {
        entity: "Product",
        entityId: product._id.toString(),
        label: `${product.name} (SKU: ${product.sku || product._id})`
      },
      details: {
        previousStock: currentStock,
        change: changeNum,
        newStock,
        reason,
        movementId: movement._id.toString(),
        approvalCode: verifiedApproval ? verifiedApproval.approvalCode : null
      },
      ip: req.ip,
      severity: changeNum < 0 ? "WARNING" : "INFO"
    });

    res.json({
      success: true,
      message: `Inventory updated successfully. New balance: ${newStock}`,
      data: {
        id: movement._id.toString(),
        product: product.toJSON(),
        balance: newStock,
        movement
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
