const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    description: {
      type: String,
      required: true
    },

    shortDescription: String,

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    discountPrice: {
      type: Number,
      default: null
    },

    images: [
      {
        url: String,
        public_id: String
      }
    ],

    sizes: [
      {
        type: String
      }
    ],

    colors: [
      {
        name: String,
        hex: String
      }
    ],

    stock: {
      type: Number,
      default: 0
    },

    featured: {
      type: Boolean,
      default: false
    },

    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"]
    },

    fabric: String,

    occasion: String,

    tags: [String],

    averageRating: {
      type: Number,
      default: 0
    },

    totalReviews: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", ProductSchema);