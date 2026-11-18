const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');
const { authenticate, optionalAuth, requireOwner, requireStaff } = require('../middleware/auth');

// Helper to extract sanitized public settings
const sanitizePublicSettings = (settings) => ({
  id: settings._id.toString(),
  showroomName: settings.showroomName || 'Ranaji Udaipur',
  tagline: settings.tagline || 'Royal Rajasthani Wedding Wardrobe & Tailoring',
  address: settings.address || '24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001',
  phone: settings.phone || '+91 98765 43210',
  whatsappNumber: settings.whatsappNumber || '919876543210',
  email: settings.email || 'contact@ranaji.com',
  customerServiceEmail: settings.customerServiceEmail || 'contact@ranaji.com',
  openingHours: settings.openingHours || 'Mon – Sun: 10:00 AM – 9:00 PM',
  googleMapsUrl: settings.googleMapsUrl || 'https://maps.google.com/?q=Surajpole+Udaipur',
  gstNumber: settings.gstNumber || '08AAAAA0000A1Z5',
  stateCode: settings.stateCode || '08',
  invoicePrefix: settings.invoicePrefix || 'RNJ',
  invoiceNotes: settings.invoiceNotes || 'All royal ensembles are handcrafted in Udaipur. Retain this invoice for trial fittings and authorized exchanges.',
  instagramUrl: settings.instagramUrl || 'https://www.instagram.com/ranaji_udaipur',
  facebookUrl: settings.facebookUrl || 'https://www.facebook.com/share/18PhEG4c3J/',
  updatedAt: settings.updatedAt
});

// GET public settings (Publicly accessible, sanitized against policy leaks)
router.get('/public', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({
      success: true,
      data: sanitizePublicSettings(settings)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET current showroom settings (Staff get operational policies, anonymous callers get sanitized public info)
router.get('/', optionalAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const isStaff = req.user && ['owner', 'admin', 'manager', 'cashier', 'inventory'].includes(req.user.role);

    if (isStaff) {
      return res.json({
        success: true,
        data: {
          id: settings._id.toString(),
          _id: settings._id.toString(),
          ...settings.toObject()
        }
      });
    }

    // Default to sanitized public information for anonymous visitors
    res.json({
      success: true,
      data: sanitizePublicSettings(settings)
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
      'customerServiceEmail',
      'openingHours',
      'googleMapsUrl',
      'gstNumber',
      'stateCode',
      'invoicePrefix',
      'invoiceNotes',
      'instagramUrl',
      'facebookUrl',
      'maxCashierDiscountPercent',
      'maxCashierDiscountAmount',
      'maxInventoryWriteOffQty',
      'requireApprovalForRefunds',
      'requireApprovalForWriteOffs'
    ];

    // Input validations
    if (req.body.phone && typeof req.body.phone === 'string' && req.body.phone.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }
    if (req.body.whatsappNumber && typeof req.body.whatsappNumber === 'string') {
      const cleanWa = req.body.whatsappNumber.replace(/[^0-9]/g, '');
      if (cleanWa.length < 8) {
        return res.status(400).json({ success: false, message: 'WhatsApp number must contain valid country code and digits.' });
      }
    }
    if (req.body.email && typeof req.body.email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const changes = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        changes[field] = {
          before: settings[field],
          after: req.body[field]
        };
        settings[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
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
