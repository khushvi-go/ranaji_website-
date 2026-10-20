const express = require("express");
const router = express.Router();
const Rental = require("../models/Rental");
const { optionalAuth } = require("../middleware/auth");

// GET all rentals
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const rentals = await Rental.find(query).sort({ createdAt: -1 });

    const formatted = rentals.map((r) => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      rentalNumber: r.rentalNumber,
      customer: r.customer,
      items: r.items,
      startDate: r.startDate,
      returnDateExpected: r.returnDateExpected,
      returnDateActual: r.returnDateActual,
      securityDeposit: r.securityDeposit,
      totalRentalFee: r.totalRentalFee,
      status: r.status,
      returnNotes: r.returnNotes,
      createdAt: r.createdAt
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new rental
router.post("/", optionalAuth, async (req, res) => {
  try {
    const count = await Rental.countDocuments();
    const year = new Date().getFullYear();
    const rentalNumber = req.body.rentalNumber || `RNT-${year}-${String(count + 1).padStart(4, "0")}`;

    const customer = req.body.customer || {
      name: req.body.customerName || "Showroom Guest",
      phone: req.body.customerPhone || "+91 9999999999",
      email: req.body.customerEmail || "",
      city: req.body.city || "Udaipur"
    };

    const items = req.body.items || [
      {
        name: req.body.garmentName || req.body.productName || "Royal Ensemble",
        size: req.body.size || "Standard",
        rentPrice: Number(req.body.rentPrice) || 0,
        quantity: Number(req.body.quantity) || 1
      }
    ];

    const startDate = req.body.startDate || req.body.rentalStartDate || new Date();
    const returnDateExpected = req.body.returnDateExpected || req.body.rentalEndDate || new Date(Date.now() + 3 * 86400000);

    let status = req.body.status || "RESERVED";
    if (typeof status === "string") {
      const upper = status.toUpperCase();
      if (["RESERVED", "DISPATCHED", "RETURNED", "OVERDUE", "CANCELLED"].includes(upper)) {
        status = upper;
      } else {
        status = "RESERVED";
      }
    }

    const rental = await Rental.create({
      rentalNumber,
      customer,
      items,
      startDate,
      returnDateExpected,
      securityDeposit: Number(req.body.securityDeposit) || 0,
      totalRentalFee: Number(req.body.totalRentalFee || req.body.rentPrice) || 0,
      status,
      returnNotes: req.body.returnNotes || ""
    });

    const rentalData = {
      id: rental._id.toString(),
      _id: rental._id.toString(),
      rentalNumber: rental.rentalNumber,
      ...rental.toObject()
    };

    res.status(201).json({
      success: true,
      data: rentalData,
      rental: rentalData
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update rental status
router.put("/:id/status", optionalAuth, async (req, res) => {
  try {
    const { status, returnNotes } = req.body;
    const update = { status };
    if (status === "RETURNED") {
      update.returnDateActual = new Date();
    }
    if (returnNotes) update.returnNotes = returnNotes;

    const rental = await Rental.findByIdAndUpdate(req.params.id, update, {
      new: true
    });

    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found" });
    }

    res.json({
      success: true,
      data: {
        id: rental._id.toString(),
        _id: rental._id.toString(),
        ...rental.toObject()
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
