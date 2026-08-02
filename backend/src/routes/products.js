const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const { authenticate } = require("../middleware/auth");

// GET all products
router.get("/", async (req, res) => {
  try {
    const { category, active } = req.query;

    let query = {};

    if (category) query.category = category;

    if (active === "true")
      query.isActive = true;

    const products = await Product.find(query).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
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
router.post("/", authenticate, async (req, res) => {

  try {

    const product = await Product.create(req.body);

    res.status(201).json({
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