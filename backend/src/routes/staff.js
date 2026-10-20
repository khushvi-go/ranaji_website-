const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticate, requireOwner, requireManagerOrOwner } = require('../middleware/auth');

const STAFF_ROLES = ['owner', 'admin', 'manager', 'cashier', 'inventory'];

// GET all showroom staff members (Manager and Owner only)
router.get('/', authenticate, requireManagerOrOwner, async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: STAFF_ROLES }
    })
      .select('-password')
      .sort({ createdAt: -1 });

    const formatted = staff.map((s) => ({
      id: s._id.toString(),
      _id: s._id.toString(),
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role === 'admin' ? 'owner' : s.role,
      employeeId: s.employeeId || '',
      isActive: s.isActive !== false,
      lastLogin: s.lastLogin,
      createdAt: s.createdAt,
      deactivatedAt: s.deactivatedAt
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new individual staff account (Owner only)
router.post('/', authenticate, requireOwner, async (req, res) => {
  try {
    const { name, email, password, phone, role, employeeId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, temporary password, and role are required.'
      });
    }

    const normalizedRole = role.toLowerCase().trim();
    if (!['owner', 'manager', 'cashier', 'inventory'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: owner, manager, cashier, inventory.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this email already exists.'
      });
    }

    const newStaff = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone ? phone.trim() : '',
      role: normalizedRole,
      employeeId: employeeId ? employeeId.trim() : `RNJ-EMP-${Date.now().toString().slice(-4)}`,
      provider: 'local',
      emailVerified: true,
      isActive: true
    });

    await AuditLog.record({
      actor: req.user,
      action: 'STAFF_CREATED',
      target: {
        entity: 'User',
        entityId: newStaff._id.toString(),
        label: `${newStaff.name} (${newStaff.role})`
      },
      details: {
        email: newStaff.email,
        role: newStaff.role,
        employeeId: newStaff.employeeId
      },
      ip: req.ip,
      severity: 'WARNING'
    });

    res.status(201).json({
      success: true,
      message: `Staff account created for ${newStaff.name} with role ${newStaff.role}.`,
      data: {
        id: newStaff._id.toString(),
        _id: newStaff._id.toString(),
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        employeeId: newStaff.employeeId,
        isActive: newStaff.isActive
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update staff role (Owner only)
router.put('/:id/role', authenticate, requireOwner, async (req, res) => {
  try {
    const { role } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    const normalizedRole = (role || '').toLowerCase().trim();
    if (!['owner', 'manager', 'cashier', 'inventory'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be owner, manager, cashier, or inventory.'
      });
    }

    const oldRole = targetUser.role;
    targetUser.role = normalizedRole;
    await targetUser.save();

    await AuditLog.record({
      actor: req.user,
      action: 'STAFF_ROLE_CHANGED',
      target: {
        entity: 'User',
        entityId: targetUser._id.toString(),
        label: `${targetUser.name}`
      },
      details: {
        oldRole,
        newRole: normalizedRole
      },
      ip: req.ip,
      severity: 'CRITICAL'
    });

    res.json({
      success: true,
      message: `Role for ${targetUser.name} updated from ${oldRole} to ${normalizedRole}.`,
      data: {
        id: targetUser._id.toString(),
        role: targetUser.role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT immediate staff revocation / deactivation (Owner only)
router.put('/:id/deactivate', authenticate, requireOwner, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    // Prevent owner self-deactivation lockout
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security safeguard: You cannot deactivate your own owner account.'
      });
    }

    targetUser.isActive = false;
    targetUser.deactivatedAt = new Date();
    targetUser.deactivatedBy = req.user._id;
    await targetUser.save();

    await AuditLog.record({
      actor: req.user,
      action: 'STAFF_DEACTIVATED',
      target: {
        entity: 'User',
        entityId: targetUser._id.toString(),
        label: `${targetUser.name} (${targetUser.role})`
      },
      details: {
        reason: req.body.reason || 'Staff departure or security revocation'
      },
      ip: req.ip,
      severity: 'CRITICAL'
    });

    res.json({
      success: true,
      message: `Staff account for ${targetUser.name} has been immediately revoked and deactivated. All access tokens are invalidated.`,
      data: {
        id: targetUser._id.toString(),
        isActive: false
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT reactivate staff account (Owner only)
router.put('/:id/reactivate', authenticate, requireOwner, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    targetUser.isActive = true;
    targetUser.deactivatedAt = null;
    targetUser.deactivatedBy = null;
    await targetUser.save();

    await AuditLog.record({
      actor: req.user,
      action: 'STAFF_REACTIVATED',
      target: {
        entity: 'User',
        entityId: targetUser._id.toString(),
        label: `${targetUser.name} (${targetUser.role})`
      },
      details: {
        notes: req.body.notes || 'Reactivated by showroom owner'
      },
      ip: req.ip,
      severity: 'WARNING'
    });

    res.json({
      success: true,
      message: `Staff account for ${targetUser.name} has been restored and activated.`,
      data: {
        id: targetUser._id.toString(),
        isActive: true
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
