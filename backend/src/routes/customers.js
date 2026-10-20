const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const AuditLog = require("../models/AuditLog");
const { authenticate, optionalAuth, requireStaff, requireOwner, requireManagerOrOwner } = require("../middleware/auth");

// GET export customer records (Manager and Owner only - prevents bulk cashier exfiltration)
router.get("/export", authenticate, requireManagerOrOwner, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const exportData = customers.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      city: c.city || "Udaipur",
      address: c.address || "",
      totalSpent: c.totalSpent || 0,
      ordersCount: c.ordersCount || 0,
      balance: c.balance || 0,
      measurements: c.measurements || {},
      notes: c.notes || "",
      createdAt: c.createdAt
    }));

    // Audit log the export event
    await AuditLog.record({
      actor: req.user,
      action: "CUSTOMER_EXPORTED",
      target: {
        entity: "Customer",
        entityId: "BULK_EXPORT",
        label: `Customer Directory Export (${exportData.length} records)`
      },
      details: {
        recordCount: exportData.length,
        exportedAt: new Date().toISOString()
      },
      ip: req.ip,
      severity: "WARNING"
    });

    res.json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all customers (Staff or authorized caller)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } }
      ];
    }

    const customers = await Customer.find(query).sort({ updatedAt: -1 });

    const formatted = customers.map((c) => ({
      id: c._id.toString(),
      _id: c._id.toString(),
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      city: c.city || "Udaipur",
      address: c.address || "",
      totalSpent: c.totalSpent || 0,
      ordersCount: c.ordersCount || 0,
      balance: c.balance || 0,
      measurements: c.measurements || {},
      notes: c.notes || "",
      createdBy: c.createdBy,
      lastUpdatedBy: c.lastUpdatedBy,
      createdAt: c.createdAt
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

// GET single customer
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    let customer = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findById(req.params.id);
    }
    if (!customer) {
      customer = await Customer.findOne({ phone: req.params.id });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({
      success: true,
      data: {
        id: customer._id.toString(),
        _id: customer._id.toString(),
        ...customer.toObject()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE customer (Staff or online customer registration)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { name, phone, email, city, address, measurements, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone number are required"
      });
    }

    const cleanPhone = phone.trim();
    let existing = await Customer.findOne({ phone: cleanPhone });
    if (existing) {
      const custData = {
        id: existing._id.toString(),
        _id: existing._id.toString(),
        ...existing.toObject()
      };
      return res.status(200).json({
        success: true,
        message: "Existing customer retrieved",
        customer: custData,
        data: custData
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : "",
      city: city || "Udaipur",
      address: address || "",
      measurements: measurements || {},
      notes: notes || "",
      createdBy: req.user ? req.user._id : null,
      lastUpdatedBy: req.user ? req.user._id : null
    });

    const customerData = {
      id: customer._id.toString(),
      _id: customer._id.toString(),
      ...customer.toObject()
    };

    if (req.user) {
      await AuditLog.record({
        actor: req.user,
        action: "CUSTOMER_CREATED",
        target: {
          entity: "Customer",
          entityId: customer._id.toString(),
          label: `${customer.name} (${customer.phone})`
        },
        details: { phone: customer.phone, email: customer.email },
        ip: req.ip,
        severity: "INFO"
      });
    }

    res.status(201).json({
      success: true,
      customer: customerData,
      data: customerData
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE customer (Staff only)
router.put("/:id", authenticate, requireStaff, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user._id
    };

    const customer = await Customer.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await AuditLog.record({
      actor: req.user,
      action: "CUSTOMER_UPDATED",
      target: {
        entity: "Customer",
        entityId: customer._id.toString(),
        label: `${customer.name} (${customer.phone})`
      },
      details: { updatedFields: Object.keys(req.body) },
      ip: req.ip,
      severity: "INFO"
    });

    res.json({
      success: true,
      data: {
        id: customer._id.toString(),
        _id: customer._id.toString(),
        ...customer.toObject()
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE customer (Strictly restricted to Owner)
router.delete("/:id", authenticate, requireOwner, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await Customer.findByIdAndDelete(req.params.id);

    await AuditLog.record({
      actor: req.user,
      action: "CUSTOMER_DELETED",
      target: {
        entity: "Customer",
        entityId: customer._id.toString(),
        label: `${customer.name} (${customer.phone})`
      },
      details: { deletedCustomerPhone: customer.phone, deletedCustomerName: customer.name },
      ip: req.ip,
      severity: "WARNING"
    });

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
