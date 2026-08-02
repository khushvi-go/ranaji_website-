const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AddressSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Home", "Office", "Village", "Other"],
      default: "Home",
    },
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: "India",
    },
    landmark: String,
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
    chest: String,
    shoulder: String,
    sleeveLength: String,
    armHole: String,
    frontNeck: String,
    backNeck: String,
    waist: String,
    hips: String,
    inseam: String,
    thigh: String,
    knee: String,
    ankle: String,
    outseam: String,
    height: String,
    weight: String,
    notes: String,
  },
  { _id: false }
);

const SizePreferenceSchema = new mongoose.Schema(
  {
    shirtSize: String,
    pantSize: String,
    kurtaSize: String,
    sherwaniSize: String,
    lehengaSize: String,
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
      enum: ["customer", "admin"],
      default: "customer",
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

    lastLogin: Date,

    profile: {
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other", ""],
        default: "",
      },
    },

    addresses: [AddressSchema],

    measurements: MeasurementSchema,

    sizePreferences: SizePreferenceSchema,

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

module.exports = mongoose.model("User", UserSchema);