const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    productName: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    orderType: {
      type: String,
      enum: ["purchase", "rent"],
      default: "purchase"
    },
    size: {
      type: String,
      default: "Standard"
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    rentalDays: {
      type: Number,
      default: 0
    },
    rentalStartDate: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      trim: true,
      default: ""
    },
    items: [orderItemSchema],
    deliveryType: {
      type: String,
      enum: ["showroom", "delivery"],
      default: "showroom"
    },
    shippingAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "Udaipur" },
      state: { type: String, default: "Rajasthan" },
      pincode: { type: String, default: "313001" },
      country: { type: String, default: "India" }
    },
    paymentMethod: {
      type: String,
      default: "whatsapp"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    orderStatus: {
      type: String,
      default: "Pending"
    },
    subtotal: {
      type: Number,
      default: 0
    },
    securityDeposit: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    fittingNotes: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.orderId = ret.orderNumber;
    return ret;
  }
});

orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);