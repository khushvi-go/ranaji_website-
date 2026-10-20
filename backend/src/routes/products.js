const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Product = require("../models/product");
const Category = require("../models/Category");
const AuditLog = require("../models/AuditLog");
const { authenticate, optionalAuth, requireInventoryStaff, requireManagerOrOwner } = require("../middleware/auth");

// GET all products
router.get("/", async (req, res) => {
  try {
    const {
      category,
      subcategory,
      active,
      search,
      featured,
      gender,
      availableFor,
      sort,
      minPrice,
      maxPrice,
      all
    } = req.query;

    let query = {};

    // Category filtering: support ObjectId or category slug or name
    if (category && category !== "all") {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({
          $or: [{ slug: category.toLowerCase() }, { name: new RegExp(`^${category}$`, "i") }]
        });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          // No category match found, so query by slug string fallback if any
          query.category = null;
        }
      }
    }

    if (subcategory && subcategory !== "all") {
      query.subcategory = new RegExp(`^${subcategory}$`, "i");
    }

    if (active === "true") {
      query.status = "published";
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (gender) {
      query.gender = gender;
    }

    if (availableFor && availableFor !== "all") {
      query.availableFor = { $in: [availableFor] };
    }

    if (minPrice || maxPrice) {
      query["price.purchasePrice"] = {};
      if (minPrice) query["price.purchasePrice"].$gte = Number(minPrice);
      if (maxPrice && maxPrice !== "Infinity") query["price.purchasePrice"].$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    let sortOption = { createdAt: -1 };

    switch (sort) {
      case "price-low":
        sortOption = { "price.purchasePrice": 1 };
        break;
      case "price-high":
        sortOption = { "price.purchasePrice": -1 };
        break;
      case "name-asc":
        sortOption = { name: 1 };
        break;
      case "rating":
        sortOption = { averageRating: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { featured: -1, createdAt: -1 };
    }

    const total = await Product.countDocuments(query);

    let queryExec = Product.find(query).populate("category", "name slug").sort(sortOption);

    if (all !== "true") {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 24));
      const skip = (page - 1) * limit;
      queryExec = queryExec.skip(skip).limit(limit);
    }

    const products = await queryExec;

    // Format products for frontend consumption
    const formattedProducts = products.map((prod) => {
      const json = prod.toJSON();
      if (json.category && typeof json.category === "object") {
        json.categorySlug = json.category.slug;
        json.categoryName = json.category.name;
        json.category = json.category.slug || json.category.name;
      }
      return json;
    });

    res.json({
      success: true,
      total,
      count: formattedProducts.length,
      data: formattedProducts
    });
  } catch (err) {
    console.error("GET products error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    let product = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(req.params.id).populate("category", "name slug");
    }
    if (!product) {
      product = await Product.findOne({ slug: req.params.id }).populate("category", "name slug");
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const json = product.toJSON();
    if (json.category && typeof json.category === "object") {
      json.categorySlug = json.category.slug;
      json.categoryName = json.category.name;
      json.category = json.category.slug || json.category.name;
    }

    res.json({
      success: true,
      data: json
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// CREATE product (Inventory staff, Manager, Owner)
router.post("/", authenticate, requireInventoryStaff, upload.array("images", 5), async (req, res) => {
  try {
    const images = req.files && req.files.length > 0
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.filename
        }))
      : req.body.image
      ? [{ url: req.body.image, publicId: "" }]
      : [{ url: "/images/image.png", publicId: "" }];

    // Resolve Category ID
    let categoryId = req.body.category;
    if (categoryId && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      let catDoc = await Category.findOne({
        $or: [{ slug: categoryId.toLowerCase() }, { name: new RegExp(`^${categoryId}$`, "i") }]
      });
      if (!catDoc) {
        catDoc = await Category.create({
          name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
          slug: categoryId.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        });
      }
      categoryId = catDoc._id;
    }

    const baseSlug = (req.body.slug || req.body.name || `product-${Date.now()}`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const purchasePrice = Number(req.body.price) || Number(req.body.purchasePrice) || 0;
    const rentPrice = Number(req.body.rentPrice) || Math.round(purchasePrice * 0.3);

    const sizes = Array.isArray(req.body.sizes)
      ? req.body.sizes
      : typeof req.body.sizes === "string"
      ? req.body.sizes.split(",").map((s) => s.trim())
      : ["38 (M)", "40 (L)", "42 (XL)", "Custom Fit"];

    const availableFor = Array.isArray(req.body.available)
      ? req.body.available
      : Array.isArray(req.body.availableFor)
      ? req.body.availableFor
      : typeof req.body.available === "string"
      ? req.body.available.split(",").map((a) => a.trim())
      : ["purchase", "rent"];

    const product = await Product.create({
      name: req.body.name,
      slug,
      description: req.body.description || "Exclusive Royal Ensemble from Ranaji Showroom, Udaipur.",
      category: categoryId,
      subcategory: req.body.subcategory || "",
      price: {
        purchasePrice,
        rentPrice
      },
      priceType: req.body.priceType || "Starting Price",
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 5,
      sku: req.body.sku || `RNJ-SKU-${Date.now().toString().slice(-6)}`,
      fabric: req.body.fabric || "Royal Silk",
      color: req.body.color || "Royal Classic",
      featured: req.body.featured === true || req.body.featured === "true",
      badge: req.body.badge || (req.body.featured ? "Featured" : ""),
      availableFor,
      sizes,
      images,
      status: req.body.status || "published"
    });

    const populated = await Product.findById(product._id).populate("category", "name slug");

    await AuditLog.record({
      actor: req.user,
      action: "PRODUCT_CREATED",
      target: {
        entity: "Product",
        entityId: product._id.toString(),
        label: product.name
      },
      details: {
        sku: product.sku,
        stock: product.stock,
        purchasePrice: product.price?.purchasePrice
      },
      ip: req.ip,
      severity: "INFO"
    });

    res.status(201).json({
      success: true,
      data: populated.toJSON()
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE product (Inventory staff, Manager, Owner)
router.put("/:id", authenticate, requireInventoryStaff, upload.array("images", 5), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename
      }));
    } else if (req.body.image) {
      updateData.images = [{ url: req.body.image, publicId: "" }];
    }

    // Resolve Category ID if string
    if (updateData.category && !updateData.category.match(/^[0-9a-fA-F]{24}$/)) {
      const catDoc = await Category.findOne({
        $or: [{ slug: updateData.category.toLowerCase() }, { name: new RegExp(`^${updateData.category}$`, "i") }]
      });
      if (catDoc) {
        updateData.category = catDoc._id;
      }
    }

    if (updateData.price !== undefined || updateData.rentPrice !== undefined) {
      updateData.price = {
        purchasePrice: Number(updateData.price) || 0,
        rentPrice: Number(updateData.rentPrice) || Math.round((Number(updateData.price) || 0) * 0.3)
      };
    }

    if (updateData.available) {
      updateData.availableFor = Array.isArray(updateData.available)
        ? updateData.available
        : updateData.available.split(",").map((a) => a.trim());
    }

    if (updateData.sizes && typeof updateData.sizes === "string") {
      updateData.sizes = updateData.sizes.split(",").map((s) => s.trim());
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await AuditLog.record({
      actor: req.user,
      action: "PRODUCT_UPDATED",
      target: {
        entity: "Product",
        entityId: product._id.toString(),
        label: product.name
      },
      details: {
        updatedFields: Object.keys(updateData)
      },
      ip: req.ip,
      severity: "INFO"
    });

    res.json({
      success: true,
      data: product.toJSON()
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// DELETE product (Manager and Owner only)
router.delete("/:id", authenticate, requireManagerOrOwner, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    await AuditLog.record({
      actor: req.user,
      action: "PRODUCT_DELETED",
      target: {
        entity: "Product",
        entityId: product._id.toString(),
        label: `${product.name} (SKU: ${product.sku || product._id})`
      },
      details: {
        sku: product.sku,
        name: product.name,
        price: product.price
      },
      ip: req.ip,
      severity: "WARNING"
    });

    res.json({
      success: true,
      message: "Product deleted successfully from MongoDB Atlas"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;