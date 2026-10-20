const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");
const { authenticate, requireAdmin } = require("../middleware/auth");
const passport = require("passport");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password"
      });
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    // Create new user (password is automatically hashed by UserSchema pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : "",
      role: "customer",
      provider: "local",
      emailVerified: false,
      lastLogin: new Date()
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Welcome to Ranaji Royal Showroom",
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration"
    });
  }
});

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login"
  }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        {
          id: req.user._id,
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/success?token=${token}`
      );
    } catch (error) {
      console.error("Google auth callback error:", error);
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login`);
    }
  }
);

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account is deactivated. Please contact support."
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

// Verify token
router.get("/verify", authenticate, async (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user.toJSON()
  });
});

// Get current user profile
router.get("/profile", authenticate, async (req, res) => {
  res.json({
    success: true,
    user: req.user.toJSON()
  });
});

// Update user profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, phone, profile, address, measurements, sizePreferences } = req.body;

    if (name) req.user.name = name.trim();
    if (phone !== undefined) req.user.phone = phone.trim();
    if (profile) req.user.profile = { ...req.user.profile, ...profile };
    if (address) req.user.address = { ...req.user.address, ...address };
    if (measurements) req.user.measurements = { ...req.user.measurements, ...measurements };
    if (sizePreferences) req.user.sizePreferences = { ...req.user.sizePreferences, ...sizePreferences };

    await req.user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
});

// Update password
router.put("/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password"
      });
    }

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password does not match"
      });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password"
    });
  }
});

// Get user orders (searches Order collection + user.orders)
router.get("/orders", authenticate, async (req, res) => {
  try {
    const persistentOrders = await Order.find({
      $or: [{ user: req.user._id }, { customerEmail: req.user.email }, { customerPhone: req.user.phone }]
    }).sort({ createdAt: -1 });

    const combinedOrders = [...persistentOrders];
    if (req.user.orders && req.user.orders.length > 0) {
      req.user.orders.forEach((o) => {
        if (!combinedOrders.some((co) => co.orderNumber === o.orderId || co.orderNumber === o.orderNumber)) {
          combinedOrders.push(o);
        }
      });
    }

    res.json({
      success: true,
      orders: combinedOrders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders"
    });
  }
});

// Create custom/online order from authenticated user
router.post("/orders", authenticate, async (req, res) => {
  try {
    const { items, total, deliveryAddress, notes, securityDeposit, deliveryType } = req.body;

    const orderNumber = `RNJ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const formattedItems = (items || []).map((it) => ({
      productName: it.product || it.name || "Custom Garment",
      quantity: it.quantity || 1,
      size: it.size || "Standard",
      unitPrice: it.price || 0,
      orderType: it.type || "purchase"
    }));

    const newOrder = await Order.create({
      orderNumber,
      user: req.user._id,
      customerName: req.user.name,
      customerPhone: req.user.phone || "",
      customerEmail: req.user.email,
      items: formattedItems,
      deliveryType: deliveryType || "showroom",
      shippingAddress: deliveryAddress || req.user.address,
      subtotal: total || 0,
      securityDeposit: securityDeposit || 0,
      total: total || 0,
      notes: notes || "",
      orderStatus: "Confirmed"
    });

    // Also push into user history
    req.user.orders.push({
      orderId: orderNumber,
      items: formattedItems,
      total,
      status: "Confirmed",
      type: "custom",
      notes: notes || "",
      createdAt: new Date().toISOString(),
      deliveryAddress: deliveryAddress || req.user.address
    });
    await req.user.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record order: " + error.message
    });
  }
});

// Admin: Get all users
router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({
      success: true,
      users: users.map((u) => u.toJSON())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
