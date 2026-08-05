const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Product = require("../models/Product");
const { authenticate } = require("../middleware/auth");

// GET all products
router.get("/", async (req, res) => {
  try {
    const {
      category,
      active,
      search,
      featured,
      gender,
      availableFor,
      sort,
    } = req.query;

    let query = {};

    if (category) query.category = category;

    if (active === "true")
      query.isActive = true;
    
    if (featured === "true")
      query.featured = true;
    
    if (gender)
      query.gender = gender;
    
    if (availableFor)
      query.availableFor =  { $in: [availableFor] };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    
    const skip = (page - 1) * limit;
    
    const total = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

      res.json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        count: products.length,
        data: products,
      });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
  let sortOption = { createdAt: -1 };

switch (sort) {
  case "price-low":
    sortOption = { "price.purchasePrice": 1 };
    break;

  case "price-high":
    sortOption = { "price.purchasePrice": -1 };
    break;

  case "rating":
    sortOption = { averageRating: -1 };
    break;

  case "oldest":
    sortOption = { createdAt: 1 };
    break;

  default:
    sortOption = { createdAt: -1 };
}
});

// GET single product
router.get("/:id", async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

});

// CREATE product
router.post(
  "/",
  // authenticate,
  upload.array("images", 5),
  async (req, res) => {
      try {
        const images = req.files
        ? req.files.map(file => ({
            url: file.path,
            publicId: file.filename,
          }))
        : [];
          
        console.log("BODY:");
        console.log(req.body);
        
        console.log("FILES");
        console.log(req.files);
        
        console.log("IMAGES");
        console.log(images);

          const product = await Product.create({
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
            category: req.body.category,
          
            price: {
              purchasePrice: req.body.purchasePrice
                ? Number(req.body.purchasePrice)
                : null,
            
              rentPrice: req.body.rentPrice
                ? Number(req.body.rentPrice)
                : null,
            },
            
            stock: req.body.stock
              ? Number(req.body.stock)
              : 0,
            featured: req.body.featured === "true",
          
            availableFor: req.body.availableFor
              ? req.body.availableFor.split(",")
              : ["purchase"],
          
            images,
          });
          
          res.status(201).json({
              success: true,
              data: product
          });

      } catch (error) {
          res.status(400).json({
              success: false,
              message: error.message
          });
      }
  }
);

// UPDATE product
router.put("/:id", authenticate, async (req, res) => {

  try {

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message,
    });

  }

});

// DELETE product
router.delete("/:id", authenticate, async (req, res) => {

  try {

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

});

module.exports = router;