const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { optionalAuth } = require("../middleware/auth");

// GET all services (public)
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};

    if (active === "true") query.isActive = true;

    const services = await Service.find(query).sort({ order: 1 });

    const formatted = services.map((s) => ({
      id: s._id.toString(),
      _id: s._id.toString(),
      title: s.title,
      description: s.description,
      features: s.features || [],
      icon: s.icon || "Crown",
      order: s.order || 0,
      isActive: s.isActive,
      createdAt: s.createdAt
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single service
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.json({
      success: true,
      data: {
        id: service._id.toString(),
        _id: service._id.toString(),
        ...service.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new service
router.post("/", optionalAuth, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({
      success: true,
      data: {
        id: service._id.toString(),
        _id: service._id.toString(),
        ...service.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update service
router.put("/:id", optionalAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.json({
      success: true,
      data: {
        id: service._id.toString(),
        _id: service._id.toString(),
        ...service.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE service
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
