const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    customer: {
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
      },
      name: { type: String, default: "Walk-in Customer" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      city: { type: String, default: "Udaipur" },
      address: { type: String, default: "" }
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        name: { type: String, required: true },
        sku: { type: String, default: "" },
        mode: { type: String, enum: ["buy", "rent"], default: "buy" },
        size: { type: String, default: "Standard" },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        discount: { type: Number, default: 0 },
        taxableAmount: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, required: true }
      }
    ],
    calculation: {
      subtotal: { type: Number, default: 0 },
      itemDiscounts: { type: Number, default: 0 },
      specialDiscount: { type: Number, default: 0 },
      taxableAmount: { type: Number, default: 0 },
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
      totalTax: { type: Number, default: 0 },
      roundOff: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      paidAmount: { type: Number, default: 0 },
      balanceRemaining: { type: Number, default: 0 }
    },
    payments: [
      {
        method: { type: String, default: "UPI" },
        amount: { type: Number, required: true },
        reference: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    cashier: {
      type: String,
      default: "Showroom Staff"
    },
    register: {
      type: String,
      default: "Counter 01"
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["PAID", "PARTIALLY_PAID", "PENDING", "CANCELLED", "REFUNDED", "CORRECTED"],
      default: "PAID"
    },
    refundDetails: {
      isRefunded: { type: Boolean, default: false },
      refundAmount: { type: Number, default: 0 },
      refundReason: { type: String, default: "" },
      refundedAt: { type: Date, default: null },
      refundedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, default: "" },
        role: { type: String, default: "" }
      },
      approvalId: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovalRequest" }
    },
    correctionHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        actor: {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          name: { type: String, default: "" },
          role: { type: String, default: "" }
        },
        action: { type: String, required: true },
        reason: { type: String, default: "" },
        previousStatus: String,
        newStatus: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Sale", SaleSchema);
