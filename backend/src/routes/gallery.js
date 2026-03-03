const express = require('express');
const router = express.Router();
const { Gallery } = require('../config/db-json');
const { authenticate } = require('../middleware/auth');

// GET all gallery images (public)
router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    let query = {};
    
    if (category) query.category = category.toLowerCase();
    if (active === 'true') query.isActive = true;
    
    const images = Gallery.find(query).sort({ createdAt: -1 }).data;
    res.json({ success: true, count: images.length, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single image (public)
router.get('/:id', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.json({ success: true, data: image });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new image (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const image = await Gallery.create(req.body);
    res.status(201).json({ success: true, data: image });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update image (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.json({ success: true, data: image });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE image (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
