const express = require("express");
const router = express.Router();
const Rental = require("../models/Rental");
const { authenticate, requireStaff, requireCashierStaff } = require("../middleware/auth");

// GET all rentals (Showroom staff only)
router.get("/", authenticate, requireStaff, async (req, res) => {
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

// POST new rental (Cashier, Manager, Owner)
router.post("/", authenticate, requireCashierStaff, async (req, res) => {
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

    const totalRentalFee = items.reduce(
      (sum, item) => sum + (Number(item.rentPrice) || 0) * (Number(item.quantity) || 1),
      0
    );

    const securityDeposit = req.body.securityDeposit !== undefined
      ? Number(req.body.securityDeposit)
      : Math.round(totalRentalFee * 0.5);

    const rental = await Rental.create({
      rentalNumber,
      customer,
      items,
      startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
      returnDateExpected: req.body.returnDateExpected
        ? new Date(req.body.returnDateExpected)
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default 3 days rental
      securityDeposit,
      totalRentalFee,
      status: "ACTIVE",
      returnNotes: req.body.notes || ""
    });

    res.status(201).json({
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

// PUT update rental status (Showroom staff only)
router.put("/:id/status", authenticate, requireStaff, async (req, res) => {
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
