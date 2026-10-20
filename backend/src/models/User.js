const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AddressSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Home", "Office", "Village", "Other"],
      default: "Home",
    },
    street: { type: String, default: "" },
    city: { type: String, default: "Udaipur" },
    state: { type: String, default: "Rajasthan" },
    pincode: { type: String, default: "313001" },
    country: {
      type: String,
      default: "India",
    },
    landmark: { type: String, default: "" },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    size: String,
  },
  { _id: false }
);

const MeasurementSchema = new mongoose.Schema(
  {
    chest: { type: String, default: "" },
    shoulder: { type: String, default: "" },
    sleeveLength: { type: String, default: "" },
    armHole: { type: String, default: "" },
    frontNeck: { type: String, default: "" },
    backNeck: { type: String, default: "" },
    waist: { type: String, default: "" },
    hips: { type: String, default: "" },
    inseam: { type: String, default: "" },
    thigh: { type: String, default: "" },
    knee: { type: String, default: "" },
    ankle: { type: String, default: "" },
    outseam: { type: String, default: "" },
    height: { type: String, default: "" },
    weight: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const SizePreferenceSchema = new mongoose.Schema(
  {
    shirtSize: { type: String, default: "" },
    pantSize: { type: String, default: "" },
    kurtaSize: { type: String, default: "" },
    sherwaniSize: { type: String, default: "" },
    lehengaSize: { type: String, default: "" },
  },
  { _id: false }
);

const UserOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, default: "" },
    items: { type: Array, default: [] },
    total: { type: Number, default: 0 },
    status: { type: String, default: "Order Placed" },
    type: { type: String, default: "online" },
    notes: { type: String, default: "" },
    createdAt: { type: String, default: () => new Date().toISOString() },
    deliveryAddress: { type: Object, default: {} }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["customer", "user", "admin", "owner", "manager", "cashier", "inventory"],
      default: "user",
    },

    employeeId: {
      type: String,
      default: "",
      trim: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    deactivatedAt: {
      type: Date,
      default: null,
    },

    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastLogin: Date,

    profile: {
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other", ""],
        default: "",
      },
    },

    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "Udaipur" },
      state: { type: String, default: "Rajasthan" },
      pincode: { type: String, default: "313001" },
      country: { type: String, default: "India" }
    },

    addresses: [AddressSchema],

    measurements: MeasurementSchema,

    sizePreferences: SizePreferenceSchema,

    orders: [UserOrderSchema],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    cart: [CartItemSchema],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!this.password) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.findByEmail = function (email) {
  if (!email) return null;
  return this.findOne({ email: email.toLowerCase().trim() });
};

UserSchema.statics.getAll = function () {
  return this.find().select("-password");
};

UserSchema.statics.update = function (id, data) {
  return this.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-password");
};

UserSchema.statics.addOrder = async function (userId, order) {
  return this.findByIdAndUpdate(
    userId,
    { $push: { orders: order } },
    { new: true }
  );
};

UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.password;
    return ret;
  }
});

UserSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);