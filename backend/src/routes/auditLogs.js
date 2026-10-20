const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticate, requireManagerOrOwner } = require('../middleware/auth');

// GET audit logs (Manager and Owner only)
router.get('/', authenticate, requireManagerOrOwner, async (req, res) => {
  try {
    const { action, severity, actorEmail, limit = 100, page = 1 } = req.query;
    let query = {};

    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (actorEmail) query['actor.email'] = actorEmail.toLowerCase();

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: logs.length,
      total,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Explicit rejection of any alteration or deletion attempt
router.all('/:id?', (req, res, next) => {
  if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(403).json({
      success: false,
      message: 'SECURITY VIOLATION: Audit log records are immutable and tamper-proof. Deletions and modifications are strictly forbidden by security policy.'
    });
  }
  next();
});

module.exports = router;
