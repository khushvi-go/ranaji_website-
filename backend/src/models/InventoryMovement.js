const mongoose = require("mongoose");

const InventoryMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    productName: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      default: ""
    },
    change: {
      type: Number,
      required: true
    },
    balance: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["SALE", "RENTAL_OUT", "RESTOCK", "CORRECTION", "RETURN", "DAMAGE"],
      required: true
    },
    reference: {
      type: String,
      default: "Manual Adjustment"
    },
    actor: {
      type: String,
      default: "Admin"
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("InventoryMovement", InventoryMovementSchema);
