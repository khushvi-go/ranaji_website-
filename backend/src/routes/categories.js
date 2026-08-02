const express = require("express");
const router = express.Router();

const Category = require("../models/Category");
const { authenticate } = require("../middleware/auth");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Get single category
router.get("/:id", async (req, res) => {
  try {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success:false,
        message:"Category not found"
      });
    }

    res.json({
      success:true,
      data:category
    });

  } catch(err){

    res.status(500).json({
      success:false,
      message:err.message
    });

  }
});

// Create category
router.post("/", authenticate, async (req,res)=>{

  try{

    const category = await Category.create(req.body);

    res.status(201).json({
      success:true,
      data:category
    });

  }catch(err){

    res.status(400).json({
      success:false,
      message:err.message
    });

  }

});

// Update category
router.put("/:id", authenticate, async(req,res)=>{

  try{

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new:true,
        runValidators:true
      }
    );

    if(!category){
      return res.status(404).json({
        success:false,
        message:"Category not found"
      });
    }

    res.json({
      success:true,
      data:category
    });

  }catch(err){

    res.status(400).json({
      success:false,
      message:err.message
    });

  }

});

// Delete category
router.delete("/:id", authenticate, async(req,res)=>{

  try{

    const category = await Category.findByIdAndDelete(req.params.id);

    if(!category){
      return res.status(404).json({
        success:false,
        message:"Category not found"
      });
    }

    res.json({
      success:true,
      message:"Category deleted successfully"
    });

  }catch(err){

    res.status(500).json({
      success:false,
      message:err.message
    });

  }

});

module.exports = router;