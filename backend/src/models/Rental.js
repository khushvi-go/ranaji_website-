const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema(
  {
    rentalNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      city: { type: String, default: "Udaipur" }
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        name: { type: String, required: true },
        size: { type: String, default: "Standard" },
        rentPrice: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
      }
    ],
    startDate: {
      type: Date,
      required: true
    },
    returnDateExpected: {
      type: Date,
      required: true
    },
    returnDateActual: {
      type: Date
    },
    securityDeposit: {
      type: Number,
      default: 0
    },
    totalRentalFee: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["RESERVED", "DISPATCHED", "RETURNED", "OVERDUE", "CANCELLED"],
      default: "RESERVED"
    },
    returnNotes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Rental", RentalSchema);
