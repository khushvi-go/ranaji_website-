const express = require('express');
const router = express.Router();
const { Collection } = require('../config/db-json');
const { authenticate } = require('../middleware/auth');

// GET all collections (public)
router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    let query = {};
    
    if (category) query.category = category.toLowerCase();
    if (active === 'true') query.isActive = true;
    
    const collections = Collection.find(query).sort({ createdAt: -1 }).data;
    res.json({ success: true, count: collections.length, data: collections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single collection (public)
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.json({ success: true, data: collection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new collection (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const collection = await Collection.create(req.body);
    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update collection (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.json({ success: true, data: collection });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE collection (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
