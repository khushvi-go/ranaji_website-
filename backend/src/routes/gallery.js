const express = require("express");
const router = express.Router();
const Gallery = require("../models/Gallery");
const { optionalAuth } = require("../middleware/auth");

// GET all gallery images (public)
router.get("/", async (req, res) => {
  try {
    const { category, active } = req.query;
    let query = {};

    if (category && category !== "all") query.category = category.toLowerCase();
    if (active === "true") query.isActive = true;

    const images = await Gallery.find(query).sort({ createdAt: -1 });

    const formatted = images.map((img) => ({
      id: img._id.toString(),
      _id: img._id.toString(),
      src: img.src,
      title: img.title,
      category: img.category,
      aspectRatio: img.aspectRatio || "portrait",
      isActive: img.isActive,
      createdAt: img.createdAt
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single image
router.get("/:id", async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    res.json({
      success: true,
      data: {
        id: image._id.toString(),
        _id: image._id.toString(),
        ...image.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new image
router.post("/", optionalAuth, async (req, res) => {
  try {
    const image = await Gallery.create(req.body);
    res.status(201).json({
      success: true,
      data: {
        id: image._id.toString(),
        _id: image._id.toString(),
        ...image.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update image
router.put("/:id", optionalAuth, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    res.json({
      success: true,
      data: {
        id: image._id.toString(),
        _id: image._id.toString(),
        ...image.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE image
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
