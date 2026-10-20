const express = require("express");
const router = express.Router();
const Testimonial = require("../models/Testimonial");
const { optionalAuth, authenticate, requireStaff } = require("../middleware/auth");

// GET all testimonials (public, user-specific, or admin)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { active, status, user, my } = req.query;
    let query = {};

    if (active === "true") {
      // Public site: Only approved and active testimonials
      query = {
        status: "approved",
        isActive: { $ne: false }
      };
    } else if (status) {
      query.status = status;
    }

    if (user) {
      query.user = user;
    } else if (my === "true" && req.user) {
      query.user = req.user._id;
    }

    const testimonials = await Testimonial.find(query)
      .populate("user", "name email phone avatar role")
      .sort({ createdAt: -1 });

    const formatted = testimonials.map((t) => {
      const derivedStatus = t.status || (t.isActive ? "approved" : "pending");
      return {
        id: t._id.toString(),
        _id: t._id.toString(),
        name: t.name,
        location: t.location || "Udaipur, Rajasthan",
        occasion: t.occasion || "Wedding Ensemble",
        rating: t.rating || 5,
        text: t.text,
        content: t.text,
        avatar: t.avatar || (t.name ? t.name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) : "RP"),
        status: derivedStatus,
        isActive: derivedStatus === "approved" && t.isActive !== false,
        user: t.user ? {
          id: t.user._id.toString(),
          _id: t.user._id.toString(),
          name: t.user.name,
          email: t.user.email,
          phone: t.user.phone,
          role: t.user.role
        } : null,
        userId: t.user ? (t.user._id ? t.user._id.toString() : t.user.toString()) : null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single testimonial (public)
router.get("/:id", async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).populate("user", "name email phone avatar role");
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    const derivedStatus = testimonial.status || (testimonial.isActive ? "approved" : "pending");
    res.json({
      success: true,
      data: {
        id: testimonial._id.toString(),
        _id: testimonial._id.toString(),
        ...testimonial.toObject(),
        status: derivedStatus,
        isActive: derivedStatus === "approved" && testimonial.isActive !== false,
        user: testimonial.user ? {
          id: testimonial.user._id.toString(),
          _id: testimonial.user._id.toString(),
          name: testimonial.user.name,
          email: testimonial.user.email,
          phone: testimonial.user.phone,
          role: testimonial.user.role
        } : null,
        userId: testimonial.user ? (testimonial.user._id ? testimonial.user._id.toString() : testimonial.user.toString()) : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new testimonial (public or customer submission)
router.post("/", optionalAuth, async (req, res) => {
  try {
    // Spam check (honeypot field)
    if (req.body.website || req.body.honeypot || req.body.botCheck) {
      return res.status(400).json({ success: false, message: "Spam submission detected" });
    }

    const text = (req.body.text || req.body.content || "").trim();
    const rating = Math.min(5, Math.max(1, Number(req.body.rating) || 5));
    const occasion = (req.body.occasion || req.body.serviceType || "Royal Patron Experience").trim();
    const location = (req.body.location || "Udaipur, Rajasthan").trim();

    if (!text || text.length < 10) {
      return res.status(400).json({ success: false, message: "Please share a few words about your experience (minimum 10 characters)" });
    }

    // Role & Identity enforcement
    // Rule: Authenticated users CANNOT submit under another person's identity
    let submitterName = "";
    let linkedUserId = null;

    if (req.user) {
      // Authenticated customer or staff: always bind to authentic user identity
      submitterName = req.user.name;
      linkedUserId = req.user._id;
    } else {
      // Guest submission: take provided name, never allow spoofing a userId
      submitterName = (req.body.name || "").trim();
      linkedUserId = null; // Ignore any spoofed req.body.userId from unauthenticated clients
    }

    if (!submitterName || submitterName.length < 2) {
      return res.status(400).json({ success: false, message: "Please provide your full name (at least 2 characters)" });
    }

    const isStaff = req.user && ["admin", "owner", "manager"].includes(req.user.role);
    let status = "pending";
    let isActive = false;

    if (isStaff && req.body.fromAdminPanel) {
      // If staff is creating directly via admin dashboard, honor requested status/isActive
      status = req.body.status || "approved";
      isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : (status === "approved");
    } else {
      // All user profile and public customer submissions MUST default to pending approval & inactive
      status = "pending";
      isActive = false;
    }

    const avatar = req.body.avatar || submitterName.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "RP";

    const testimonial = await Testimonial.create({
      user: linkedUserId,
      name: submitterName,
      location,
      occasion,
      rating,
      text,
      avatar,
      status,
      isActive
    });

    const formatted = {
      id: testimonial._id.toString(),
      _id: testimonial._id.toString(),
      ...testimonial.toObject(),
      user: linkedUserId ? { id: linkedUserId.toString(), _id: linkedUserId.toString(), name: submitterName } : null,
      userId: linkedUserId ? linkedUserId.toString() : null,
      status,
      isActive
    };

    res.status(201).json({
      success: true,
      message: status === "approved" 
        ? "Testimonial published successfully!" 
        : "Thank you! Your royal review has been submitted for approval and will appear publicly once verified by our team.",
      data: formatted
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Helper: Check if current user is author of testimonial
const isAuthorOfTestimonial = (testimonial, user) => {
  if (!user || !testimonial) return false;
  if (testimonial.user) {
    const testimonialUserId = testimonial.user._id ? testimonial.user._id.toString() : testimonial.user.toString();
    if (testimonialUserId === user._id.toString()) return true;
  }
  return false;
};

// PUT approve testimonial (admin/staff only, cannot approve own testimonial)
router.put("/:id/approve", authenticate, requireStaff, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    // Security Rule: Users CANNOT approve their own testimonials
    if (isAuthorOfTestimonial(testimonial, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Self-approval is forbidden. Another administrator or manager must review and approve your submission."
      });
    }

    testimonial.status = "approved";
    testimonial.isActive = true;
    await testimonial.save();

    res.json({
      success: true,
      message: "Testimonial approved successfully and published to the website.",
      data: {
        id: testimonial._id.toString(),
        _id: testimonial._id.toString(),
        ...testimonial.toObject(),
        status: "approved",
        isActive: true
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT reject testimonial (admin/staff only)
router.put("/:id/reject", authenticate, requireStaff, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    testimonial.status = "rejected";
    testimonial.isActive = false;
    await testimonial.save();

    res.json({
      success: true,
      message: "Testimonial rejected.",
      data: {
        id: testimonial._id.toString(),
        _id: testimonial._id.toString(),
        ...testimonial.toObject(),
        status: "rejected",
        isActive: false
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update testimonial (admin/staff only)
router.put("/:id", authenticate, requireStaff, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    // If attempting to approve via general update, enforce self-approval restriction
    if (req.body.status === "approved" || req.body.isActive === true) {
      if (isAuthorOfTestimonial(testimonial, req.user)) {
        return res.status(403).json({
          success: false,
          message: "Self-approval is forbidden. Another administrator or manager must review and approve your submission."
        });
      }
    }

    const updateData = { ...req.body };
    if (req.body.content && !req.body.text) {
      updateData.text = req.body.content;
    }
    
    // Sync status and isActive
    if (req.body.status === "approved") {
      updateData.isActive = true;
    } else if (req.body.status === "rejected" || req.body.status === "pending") {
      updateData.isActive = false;
    } else if (req.body.active !== undefined && req.body.isActive === undefined) {
      updateData.isActive = Boolean(req.body.active);
      updateData.status = updateData.isActive ? "approved" : "rejected";
    }

    Object.assign(testimonial, updateData);
    await testimonial.save();

    const derivedStatus = testimonial.status || (testimonial.isActive ? "approved" : "pending");

    res.json({
      success: true,
      message: "Testimonial updated successfully",
      data: {
        id: testimonial._id.toString(),
        _id: testimonial._id.toString(),
        ...testimonial.toObject(),
        status: derivedStatus,
        isActive: derivedStatus === "approved" && testimonial.isActive !== false
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE testimonial (admin/staff only)
router.delete("/:id", authenticate, requireStaff, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
