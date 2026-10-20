const express = require('express');
const router = express.Router();
const ApprovalRequest = require('../models/ApprovalRequest');
const AuditLog = require('../models/AuditLog');
const { authenticate, requireStaff, requireManagerOrOwner } = require('../middleware/auth');

// GET all approval requests (Manager and Owner only)
router.get('/', authenticate, requireManagerOrOwner, async (req, res) => {
  try {
    const { status, action } = req.query;
    let query = {};
    if (status) query.status = status;
    if (action) query.action = action;

    const requests = await ApprovalRequest.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET pending count (Manager and Owner)
router.get('/pending-count', authenticate, requireManagerOrOwner, async (req, res) => {
  try {
    const count = await ApprovalRequest.countDocuments({ status: 'PENDING' });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST request approval for high-risk action (Any staff)
router.post('/request', authenticate, requireStaff, async (req, res) => {
  try {
    const { action, details, reason } = req.body;

    if (!action || !details) {
      return res.status(400).json({
        success: false,
        message: 'Action and action details are required for approval request.'
      });
    }

    const approval = await ApprovalRequest.create({
      action,
      details,
      reason: reason || '',
      requestedBy: {
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      status: 'PENDING'
    });

    await AuditLog.record({
      actor: req.user,
      action: 'APPROVAL_REQUESTED',
      target: {
        entity: 'ApprovalRequest',
        entityId: approval._id.toString(),
        label: `${action} Request by ${req.user.name}`
      },
      details: {
        action,
        reason,
        details
      },
      ip: req.ip,
      severity: 'WARNING'
    });

    res.status(201).json({
      success: true,
      message: 'High-risk action approval requested. Awaiting manager/owner approval.',
      data: approval
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT approve request (Manager and Owner)
router.put('/:id/approve', authenticate, requireManagerOrOwner, async (req, res) => {
  try {
    const { reviewNotes } = req.body;
    const request = await ApprovalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Approval request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status.toLowerCase()}.`
      });
    }

    // Anti-collusion / self-approval prevention: Manager cannot approve their own high-risk request
    const isOwner = ['owner', 'admin'].includes(req.user.role);
    if (!isOwner && request.requestedBy.userId.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Self-approval is forbidden. Another manager or owner must approve your request.'
      });
    }

    request.status = 'APPROVED';
    request.reviewNotes = reviewNotes || 'Approved by authority';
    request.reviewedAt = new Date();
    request.reviewedBy = {
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    await request.save();

    await AuditLog.record({
      actor: req.user,
      action: 'APPROVAL_GRANTED',
      target: {
        entity: 'ApprovalRequest',
        entityId: request._id.toString(),
        label: `${request.action} Approved for ${request.requestedBy.name}`
      },
      details: {
        action: request.action,
        approvalCode: request.approvalCode,
        reviewNotes
      },
      ip: req.ip,
      severity: 'WARNING'
    });

    res.json({
      success: true,
      message: 'Action approved successfully.',
      data: request
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT reject request (Manager and Owner)
router.put('/:id/reject', authenticate, requireManagerOrOwner, async (req, res) => {
  try {
    const { reviewNotes } = req.body;
    const request = await ApprovalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Approval request not found.' });
    }

    request.status = 'REJECTED';
    request.reviewNotes = reviewNotes || 'Rejected by authority';
    request.reviewedAt = new Date();
    request.reviewedBy = {
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    await request.save();

    await AuditLog.record({
      actor: req.user,
      action: 'APPROVAL_REJECTED',
      target: {
        entity: 'ApprovalRequest',
        entityId: request._id.toString(),
        label: `${request.action} Rejected for ${request.requestedBy.name}`
      },
      details: {
        action: request.action,
        reviewNotes
      },
      ip: req.ip,
      severity: 'INFO'
    });

    res.json({
      success: true,
      message: 'Action request rejected.',
      data: request
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST verify approval code by staff during POS checkout or refund
router.post('/verify-code', authenticate, requireStaff, async (req, res) => {
  try {
    const { approvalCode, action } = req.body;

    if (!approvalCode) {
      return res.status(400).json({ success: false, message: 'Approval code is required.' });
    }

    const request = await ApprovalRequest.findOne({
      approvalCode: approvalCode.trim(),
      status: 'APPROVED'
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or unapproved authorization code.'
      });
    }

    if (action && request.action !== action) {
      return res.status(400).json({
        success: false,
        message: `Approval code is for ${request.action}, not ${action}.`
      });
    }

    res.json({
      success: true,
      valid: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
