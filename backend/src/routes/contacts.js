const express = require('express');
const router = express.Router();
const { Contact } = require('../config/db-json');
const { authenticate } = require('../middleware/auth');

// GET all contacts (protected)
router.get('/', authenticate, async (req, res) => {
  try {
    const { read } = req.query;
    let query = {};
    
    if (read === 'true') query.read = true;
    if (read === 'false') query.read = false;
    
    const contacts = Contact.find(query).sort({ createdAt: -1 }).data;
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single contact (protected)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new contact (public - from contact form)
router.post('/', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT mark contact as read (protected)
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT mark contact as replied (protected)
router.put('/:id/reply', authenticate, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { replied: true },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE contact (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET contact stats (protected)
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const unread = await Contact.countDocuments({ read: false });
    const read = await Contact.countDocuments({ read: true });
    const replied = await Contact.countDocuments({ replied: true });
    
    res.json({
      success: true,
      data: { total, unread, read, replied }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
