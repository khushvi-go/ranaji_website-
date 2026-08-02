const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    default: 1
  },

  size: {
    type: String
  },

  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [orderItemSchema],

  shippingAddress: {

    fullName: String,

    phone: String,

    street: String,

    city: String,

    state: String,

    pincode: String,

    country: {
      type: String,
      default: "India"
    }

  },

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD"
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending"
  },

  orderStatus: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled"
    ],
    default: "Pending"
  },

  subtotal: Number,

  shippingCharge: {
    type: Number,
    default: 0
  },

  total: Number

}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);