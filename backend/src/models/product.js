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
      purchasePrice: {
        type: Number,
        default: null
      },
      rentPrice: {
        type: Number,
        default: null
      }
    },

    discountPrice: {
      type: Number,
      default: null
    },

    images: [
      {
        url: String,
        publicId: String
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
    availableFor: {
      type: [String],
      enum: ["rent", "purchase"],
      default: ["purchase"]
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },

    occasion: String,

    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],

    averageRating: {
      type: Number,
      default: 0
    },

    totalReviews: {
      type: Number,
      default: 0
    },

    seo: {
      title: String,
      description: String
    },

    customTailoring: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: [
          "draft",
          "published",
          "out_of_stock"
      ],
      default: "draft"
    },

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", ProductSchema);