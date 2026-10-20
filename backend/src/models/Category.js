const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
      default: ""
    },

    image: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    subcategories: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

CategorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

CategorySchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

CategorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Category", CategorySchema);