const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { authenticate, requireStaff } = require("../middleware/auth");

// GET all bookings (Showroom staff only)
router.get("/", authenticate, requireStaff, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) query.status = status.toLowerCase();

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
      id: b._id.toString(),
      _id: b._id.toString(),
      name: b.name,
      phone: b.phone,
      occasion: b.occasion,
      lookingFor: b.lookingFor,
      date: b.date,
      message: b.message || "",
      status: b.status,
      notes: b.notes || "",
      createdAt: b.createdAt
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET stats overview (Showroom staff only)
router.get("/stats/overview", authenticate, requireStaff, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: "pending" });
    const confirmed = await Booking.countDocuments({ status: "confirmed" });
    const completed = await Booking.countDocuments({ status: "completed" });
    const cancelled = await Booking.countDocuments({ status: "cancelled" });

    res.json({
      success: true,
      data: { total, pending, confirmed, completed, cancelled }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single booking (Showroom staff only)
router.get("/:id", authenticate, requireStaff, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({
      success: true,
      data: {
        id: booking._id.toString(),
        _id: booking._id.toString(),
        ...booking.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new booking (public appointment booking)
router.post("/", async (req, res) => {
  try {
    const rawOccasion = (req.body.occasion || "wedding").toLowerCase();
    const validOccasions = ['wedding', 'engagement', 'baarat', 'sangeet', 'reception', 'festival', 'other'];
    const occasion = validOccasions.includes(rawOccasion) ? rawOccasion : 'wedding';

    const rawLookingFor = (req.body.lookingFor || "both").toLowerCase();
    let lookingFor = 'both';
    if (rawLookingFor.includes('rent')) lookingFor = 'rental';
    else if (rawLookingFor.includes('tailor')) lookingFor = 'tailoring';
    else if (rawLookingFor.includes('custom') || rawLookingFor.includes('poshak')) lookingFor = 'custom';
    else if (rawLookingFor.includes('style') || rawLookingFor.includes('saafa') || rawLookingFor.includes('group')) lookingFor = 'styling';
    else if (rawLookingFor.includes('buy') || rawLookingFor.includes('purchas')) lookingFor = 'purchase';

    const booking = await Booking.create({
      name: req.body.name,
      phone: req.body.phone,
      occasion,
      lookingFor,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      message: req.body.message || "",
      status: "pending"
    });

    const bookingData = {
      id: booking._id.toString(),
      _id: booking._id.toString(),
      ...booking.toObject()
    };

    res.status(201).json({
      success: true,
      booking: bookingData,
      data: bookingData
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update booking (Showroom staff only)
router.put("/:id", authenticate, requireStaff, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({
      success: true,
      data: {
        id: booking._id.toString(),
        _id: booking._id.toString(),
        ...booking.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE booking (Showroom staff only)
router.delete("/:id", authenticate, requireStaff, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
