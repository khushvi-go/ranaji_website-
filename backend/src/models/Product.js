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
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      default: ""
    },

    shortDescription: {
      type: String,
      default: ""
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    subcategory: {
      type: String,
      trim: true,
      default: ""
    },

    price: {
      purchasePrice: {
        type: Number,
        default: 0
      },
      rentPrice: {
        type: Number,
        default: 0
      }
    },

    discountPrice: {
      type: Number,
      default: null
    },

    priceType: {
      type: String,
      default: "Starting Price"
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

    fabric: {
      type: String,
      default: "Royal Silk"
    },

    color: {
      type: String,
      default: "Royal Classic"
    },

    stock: {
      type: Number,
      default: 5,
      min: 0
    },

    sku: {
      type: String,
      default: ""
    },

    featured: {
      type: Boolean,
      default: false
    },

    badge: {
      type: String,
      default: ""
    },

    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", ""],
      default: ""
    },

    availableFor: {
      type: [String],
      enum: ["rent", "purchase"],
      default: ["purchase", "rent"]
    },

    occasion: {
      type: String,
      default: ""
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],

    averageRating: {
      type: Number,
      default: 5.0
    },

    totalReviews: {
      type: Number,
      default: 1
    },

    seo: {
      title: String,
      description: String
    },

    customTailoring: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: ["draft", "published", "out_of_stock"],
      default: "published"
    }
  },
  {
    timestamps: true
  }
);

ProductSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ProductSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.image =
      ret.images && ret.images.length > 0 && ret.images[0].url
        ? ret.images[0].url
        : "/images/image.png";
    ret.available = ret.availableFor || ["purchase", "rent"];
    ret.rawPrice = ret.price;
    const pPrice =
      typeof ret.price === "number"
        ? ret.price
        : ret.price?.purchasePrice || 0;
    const rPrice =
      typeof ret.price === "object" && ret.price?.rentPrice
        ? ret.price.rentPrice
        : Math.round(pPrice * 0.3);
    ret.purchasePrice = pPrice;
    ret.rentPrice = rPrice;
    ret.price = pPrice;
    ret.rating = ret.averageRating || 5.0;
    ret.reviewsCount = ret.totalReviews || 1;
    return ret;
  }
});

ProductSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", ProductSchema);