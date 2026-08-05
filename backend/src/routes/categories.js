const express = require("express");
const router = express.Router();

const Category = require("../models/Category");
const { authenticate } = require("../middleware/auth");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const {
      search,
      active,
      sort,
      page,
      limit  
    } = req.query;
    let query = {};

    if (active === "true")
      query.isActive = true;
    
    if (search) {
      query.name = {
        $regex: search,
        $options: "i"
      };
    }
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));
    
    const skip = (pageNumber - 1) * pageSize;
    let sortOption = { createdAt: -1 };
    
    switch (sort) {
    
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
    
      case "name-asc":
        sortOption = { name: 1 };
        break;
    
      case "name-desc":
        sortOption = { name: -1 };
        break;
    
    }
    default:
      sortOption = { createdAt: -1 };
      break;
    const total = await Category.countDocuments(query);
    
    const categories = await Category.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);
      res.json({
        success: true,
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
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