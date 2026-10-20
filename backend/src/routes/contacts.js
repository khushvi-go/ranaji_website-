const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { optionalAuth } = require("../middleware/auth");

// GET all contacts
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { read, replied } = req.query;
    let query = {};

    if (read === "true") query.read = true;
    if (read === "false") query.read = false;
    if (replied === "true") query.replied = true;
    if (replied === "false") query.replied = false;

    const contacts = await Contact.find(query).sort({ createdAt: -1 });

    const formatted = contacts.map((c) => ({
      id: c._id.toString(),
      _id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      subject: c.subject || "General Inquiry",
      message: c.message,
      read: Boolean(c.read),
      replied: Boolean(c.replied),
      replyNotes: c.replyNotes || "",
      repliedAt: c.repliedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET contact stats
router.get("/stats/overview", optionalAuth, async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const unread = await Contact.countDocuments({ read: false });
    const read = await Contact.countDocuments({ read: true });
    const replied = await Contact.countDocuments({ replied: true });
    const pendingReply = await Contact.countDocuments({ replied: false });

    res.json({
      success: true,
      data: { total, unread, read, replied, pendingReply }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single contact
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact inquiry not found" });
    }
    res.json({
      success: true,
      data: {
        id: contact._id.toString(),
        _id: contact._id.toString(),
        ...contact.toObject(),
        phone: contact.phone || "",
        replyNotes: contact.replyNotes || ""
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new contact inquiry (public customer submission)
router.post("/", async (req, res) => {
  try {
    // Spam bot honeypot check
    if (req.body.website || req.body.botField || req.body.honeypot) {
      return res.status(400).json({ success: false, message: "Spam submission rejected" });
    }

    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const phone = (req.body.phone || "").trim();
    const subject = (req.body.subject || req.body.occasion || "").trim() || "General Inquiry";
    const message = (req.body.message || "").trim();

    // Validations
    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, message: "Please provide your full name (at least 2 characters)" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (!message || message.length < 5) {
      return res.status(400).json({ success: false, message: "Please provide a message or inquiry (at least 5 characters)" });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      read: false,
      replied: false,
      replyNotes: ""
    });

    const contactData = {
      id: contact._id.toString(),
      _id: contact._id.toString(),
      ...contact.toObject()
    };

    res.status(201).json({
      success: true,
      message: "Thank you for contacting Ranaji! Your royal inquiry has been received. Our showroom team will reach out to you shortly.",
      contact: contactData,
      data: contactData
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update contact (e.g. general update / status)
router.put("/:id", optionalAuth, async (req, res) => {
  try {
    const updateData = { ...req.body };
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({
      success: true,
      message: "Contact updated successfully",
      data: {
        id: contact._id.toString(),
        _id: contact._id.toString(),
        ...contact.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT mark as read / unread
router.put("/:id/read", optionalAuth, async (req, res) => {
  try {
    const read = req.body.read !== undefined ? Boolean(req.body.read) : true;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({
      success: true,
      message: read ? "Marked as read" : "Marked as unread",
      data: {
        id: contact._id.toString(),
        _id: contact._id.toString(),
        ...contact.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT mark as replied
router.put("/:id/reply", optionalAuth, async (req, res) => {
  try {
    const replyNotes = (req.body.replyNotes || req.body.notes || "").trim();
    const updateFields = {
      replied: true,
      read: true,
      repliedAt: new Date()
    };
    if (replyNotes) {
      updateFields.replyNotes = replyNotes;
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({
      success: true,
      message: "Inquiry marked as replied",
      data: {
        id: contact._id.toString(),
        _id: contact._id.toString(),
        ...contact.toObject()
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE contact
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({ success: true, message: "Contact inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
