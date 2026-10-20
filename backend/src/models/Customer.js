const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    city: {
      type: String,
      default: "Udaipur",
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    ordersCount: {
      type: Number,
      default: 0,
      min: 0
    },
    balance: {
      type: Number,
      default: 0
    },
    measurements: {
      chest: { type: String, default: "" },
      shoulder: { type: String, default: "" },
      sleeveLength: { type: String, default: "" },
      waist: { type: String, default: "" },
      hips: { type: String, default: "" },
      height: { type: String, default: "" },
      notes: { type: String, default: "" }
    },
    notes: {
      type: String,
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);
