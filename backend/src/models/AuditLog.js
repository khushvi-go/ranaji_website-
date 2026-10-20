const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      immutable: true
    },
    actor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      name: {
        type: String,
        default: 'System'
      },
      email: {
        type: String,
        default: 'system@ranaji.internal'
      },
      role: {
        type: String,
        default: 'system'
      }
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    target: {
      entity: {
        type: String,
        default: ''
      },
      entityId: {
        type: String,
        default: ''
      },
      label: {
        type: String,
        default: ''
      }
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ip: {
      type: String,
      default: ''
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'INFO',
      index: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// IMMUTABILITY: Prevent any update or delete operations on audit records
const preventModification = function () {
  throw new Error('Audit logs are immutable and tamper-proof. Modifications and deletions are strictly forbidden.');
};

auditLogSchema.pre('updateOne', preventModification);
auditLogSchema.pre('updateMany', preventModification);
auditLogSchema.pre('findOneAndUpdate', preventModification);
auditLogSchema.pre('findByIdAndUpdate', preventModification);
auditLogSchema.pre('deleteOne', preventModification);
auditLogSchema.pre('deleteMany', preventModification);
auditLogSchema.pre('findOneAndDelete', preventModification);
auditLogSchema.pre('findByIdAndDelete', preventModification);

// Static helper to record audit entry
auditLogSchema.statics.record = async function ({ actor, action, target, details, ip, severity = 'INFO' }) {
  try {
    const actorData = {
      userId: actor?.id || actor?._id || actor?.userId || null,
      name: actor?.name || 'Unknown Staff',
      email: actor?.email || 'unknown@ranaji.internal',
      role: actor?.role || 'staff'
    };

    return await this.create({
      timestamp: new Date(),
      actor: actorData,
      action,
      target: target || {},
      details: details || {},
      ip: ip || '',
      severity
    });
  } catch (err) {
    console.error('AuditLog record error:', err.message);
    return null;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
