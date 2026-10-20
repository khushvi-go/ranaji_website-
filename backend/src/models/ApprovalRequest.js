const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['LARGE_DISCOUNT', 'INVOICE_REFUND', 'STOCK_WRITE_OFF', 'INVOICE_CANCELLATION'],
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED'],
      default: 'PENDING',
      index: true
    },
    approvalCode: {
      type: String,
      default: () => Math.floor(100000 + Math.random() * 900000).toString(),
      index: true
    },
    requestedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true }
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    reviewedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      role: { type: String, default: '' }
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    executedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
