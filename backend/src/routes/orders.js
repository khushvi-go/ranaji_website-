const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/product");
const User = require("../models/User");
const { optionalAuth, authenticate, requireAdmin } = require("../middleware/auth");

// GET all orders
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { status, user, orderNumber, email, phone } = req.query;
    let query = {};
    if (status) query.orderStatus = status;
    if (orderNumber) query.orderNumber = orderNumber;

    if (user && (email || phone)) {
      query.$or = [
        { user: user },
        ...(email ? [{ customerEmail: new RegExp(`^${email.trim()}$`, "i") }] : []),
        ...(phone ? [{ customerPhone: phone.trim() }] : [])
      ];
    } else if (user) {
      query.user = user;
    } else if (email || phone) {
      const orClauses = [];
      if (email) orClauses.push({ customerEmail: new RegExp(`^${email.trim()}$`, "i") });
      if (phone) orClauses.push({ customerPhone: phone.trim() });
      if (orClauses.length > 0) query.$or = orClauses;
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

// GET single order
router.get("/:id", optionalAuth, async (req, res) => {
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

    res.json({
      success: true,
      data: order.toJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create online / checkout order
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
      total,
      subtotal,
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

    if (!customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone number are required"
      });
    }

    const year = new Date().getFullYear();
    const count = await Order.countDocuments();
    const orderNumber = `RNJ-${year}-${String(1000 + count + 1)}`;

    // Prepare formatted items and decrement product stock in MongoDB
    const formattedItems = [];
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice || item.price) || 0;
      const prodName = item.product?.name || item.productName || item.name || "Royal Attire";
      const prodImg = item.product?.image || item.image || "/images/image.png";

      let prodDoc = null;
      if (item.productId && item.productId.match(/^[0-9a-fA-F]{24}$/)) {
        prodDoc = await Product.findById(item.productId);
      } else if (item.product?.id && String(item.product.id).match(/^[0-9a-fA-F]{24}$/)) {
        prodDoc = await Product.findById(item.product.id);
      } else {
        prodDoc = await Product.findOne({ name: prodName });
      }

      if (prodDoc) {
        prodDoc.stock = Math.max(0, (Number(prodDoc.stock) || 0) - qty);
        await prodDoc.save();
      }

      formattedItems.push({
        productId: prodDoc ? prodDoc._id : null,
        productName: prodName,
        image: prodImg,
        orderType: item.orderType || "purchase",
        size: item.selectedSize || item.size || "Standard",
        quantity: qty,
        unitPrice,
        rentalDays: Number(item.rentalDays) || 0,
        rentalStartDate: item.rentalStartDate || ""
      });
    }

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : "",
      items: formattedItems,
      deliveryType: deliveryType || "showroom",
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || "whatsapp",
      paymentStatus: "Pending",
      orderStatus: deliveryType === "showroom" ? "Fitting Scheduled at Udaipur Showroom" : "Order Placed",
      subtotal: Number(subtotal) || Number(total) || 0,
      securityDeposit: Number(securityDeposit) || 0,
      total: Number(total) || 0,
      fittingNotes: fittingNotes || "",
      notes: notes || ""
    });

    // If authenticated, also push to user orders
    if (req.user) {
      req.user.orders.push({
        orderId: orderNumber,
        items: formattedItems,
        total: order.total,
        status: order.orderStatus,
        type: "online",
        notes: notes || "",
        createdAt: new Date().toISOString(),
        deliveryAddress: shippingAddress
      });
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: order.toJSON()
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update order status
router.put("/:id/status", optionalAuth, async (req, res) => {
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
      data: order.toJSON()
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
