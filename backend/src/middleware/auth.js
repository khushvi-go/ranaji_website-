const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const STAFF_ROLES = ["admin", "owner", "manager", "cashier", "inventory"];

// Normalize admin to owner for unified RBAC
const normalizeRole = (role) => (role === "admin" ? "owner" : role);

// =========================
// JWT Authentication Middleware
// =========================
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload."
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found."
      });
    }

    // Immediate account revocation check
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Access revoked. Your staff account has been deactivated."
      });
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

// =========================
// Optional Auth (for guest or logged in user)
// =========================
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded.userId || decoded._id;
      if (userId) {
        const user = await User.findById(userId).select("-password");
        if (user && user.isActive === false) {
          return res.status(401).json({
            success: false,
            message: "Access revoked. Your staff account has been deactivated."
          });
        }
        if (user) {
          req.user = user;
          req.userId = user._id;
        }
      }
    }
  } catch (err) {
    // Silently continue for optional auth
  }
  next();
};

// =========================
// Role-Based Authorization
// =========================
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (req.user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Access revoked. Your staff account has been deactivated."
      });
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    // Owners and Admins always have highest superuser access
    if (userRole === "owner") {
      return next();
    }

    if (!normalizedAllowed.includes(userRole)) {
      // Record unauthorized attempt in tamper-proof audit log
      await AuditLog.record({
        actor: req.user,
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        target: {
          entity: "API_ENDPOINT",
          label: `${req.method} ${req.originalUrl}`
        },
        details: {
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          method: req.method,
          path: req.originalUrl
        },
        ip: req.ip,
        severity: "WARNING"
      });

      return res.status(403).json({
        success: false,
        message: `Access denied. Insufficient permissions for [${req.user.role}]. Required: ${allowedRoles.join(", ")}.`
      });
    }

    next();
  };
};

const requireOwner = requireRole("owner");
const requireManagerOrOwner = requireRole("owner", "manager");
const requireStaff = requireRole("owner", "manager", "cashier", "inventory");
const requireInventoryStaff = requireRole("owner", "manager", "inventory");
const requireCashierStaff = requireRole("owner", "manager", "cashier");
const requireAdmin = requireRole("owner"); // backward compatibility

// =========================
// Staff / Admin Login
// =========================
const login = async (req, res) => {
  try {
    const email = (req.body.email || req.body.username || "").toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Check if account has showroom staff privileges
    if (!STAFF_ROLES.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Showroom staff credentials required."
      });
    }

    // Immediate deactivation check
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact the showroom owner."
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || "7d"
      }
    );

    // Audit successful login
    await AuditLog.record({
      actor: user,
      action: "STAFF_LOGIN",
      target: {
        entity: "User",
        entityId: user._id.toString(),
        label: `${user.name} (${user.role})`
      },
      details: {
        email: user.email,
        role: user.role,
        time: new Date()
      },
      ip: req.ip,
      severity: "INFO"
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || ""
      }
    });
  } catch (err) {
    console.error("Staff login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// =========================
// Verify Token
// =========================
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    if (!token) {
      return res.json({
        success: false,
        valid: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.json({
        success: false,
        valid: false
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user || user.isActive === false) {
      return res.json({
        success: false,
        valid: false,
        message: user && !user.isActive ? "Account deactivated" : "User not found"
      });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        employeeId: user.employeeId || ""
      }
    });
  } catch (err) {
    res.json({
      success: false,
      valid: false
    });
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireOwner,
  requireManagerOrOwner,
  requireStaff,
  requireInventoryStaff,
  requireCashierStaff,
  requireAdmin,
  login,
  verifyToken
};