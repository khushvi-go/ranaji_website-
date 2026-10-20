const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');
const { authenticate, requireOwner } = require('../middleware/auth');

// GET current showroom settings (Public)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({
      success: true,
      data: {
        id: settings._id.toString(),
        _id: settings._id.toString(),
        ...settings.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update showroom settings and security policies (Owner Only)
router.put('/', authenticate, requireOwner, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const allowedFields = [
      'showroomName',
      'tagline',
      'address',
      'phone',
      'whatsappNumber',
      'email',
      'openingHours',
      'googleMapsUrl',
      'maxCashierDiscountPercent',
      'maxCashierDiscountAmount',
      'maxInventoryWriteOffQty',
      'requireApprovalForRefunds',
      'requireApprovalForWriteOffs'
    ];

    const changes = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        changes[field] = {
          before: settings[field],
          after: req.body[field]
        };
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    // Log the security settings change to immutable audit trail
    await AuditLog.record({
      actor: req.user,
      action: 'SECURITY_SETTINGS_UPDATED',
      target: {
        entity: 'Settings',
        entityId: settings._id.toString(),
        label: 'Showroom Security & Operational Policy'
      },
      details: {
        changes
      },
      ip: req.ip,
      severity: 'WARNING'
    });

    res.json({
      success: true,
      message: 'Showroom settings and security policies updated successfully',
      data: {
        id: settings._id.toString(),
        _id: settings._id.toString(),
        ...settings.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
