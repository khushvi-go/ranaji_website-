require('dotenv').config();
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStoreModule = require('connect-mongo');
const MongoStore = MongoStoreModule.default || MongoStoreModule;
const connectDB = require("./config/database");
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const saleRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const rentalRoutes = require('./routes/rentals');
const testimonialRoutes = require('./routes/testimonials');
const galleryRoutes = require('./routes/gallery');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const contactRoutes = require('./routes/contacts');
const settingsRoutes = require('./routes/settings');
const staffRoutes = require('./routes/staff');
const auditLogRoutes = require('./routes/auditLogs');
const approvalRoutes = require('./routes/approvals');

const session = require('express-session');
const passport = require('passport');
require('./config/passport');
const { authenticate, requireStaff } = require('./middleware/auth');

// Initialize app
const app = express();

// Trust proxy for Render / reverse proxies (enables secure cookies and accurate client IP)
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(cookieParser());

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 5000
});

app.use(limiter);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validate production secrets to prevent weak fallbacks or missing environment variables
function validateProductionSecrets() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) return;

  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.trim() === "") {
    console.error("❌ [FATAL] SESSION_SECRET is not defined in production environment variables.");
    console.error("❌ A dedicated, strong SESSION_SECRET is required to sign session cookies in production.");
    throw new Error("SESSION_SECRET environment variable is required in production. Hardcoded fallback is prohibited.");
  }

  if (Buffer.byteLength(process.env.SESSION_SECRET.trim(), "utf8") < 32) {
    console.error("❌ [FATAL] SESSION_SECRET is too short in production (minimum 32 bytes required).");
    throw new Error("SESSION_SECRET environment variable is too short in production (minimum 32 bytes).");
  }

  if (process.env.SESSION_SECRET === "ranaji_showroom_secure_session_secret_2026") {
    console.error("❌ [FATAL] Default development SESSION_SECRET cannot be used in production.");
    throw new Error("SESSION_SECRET in production must not use the default development value.");
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
    console.error("❌ [FATAL] JWT_SECRET is not defined in production environment variables.");
    console.error("❌ A dedicated, cryptographically strong JWT_SECRET is required in production.");
    throw new Error("JWT_SECRET environment variable is required in production.");
  }

  if (Buffer.byteLength(process.env.JWT_SECRET.trim(), "utf8") < 32) {
    console.error("❌ [FATAL] JWT_SECRET is too short in production (minimum 32 bytes required).");
    throw new Error("JWT_SECRET environment variable is too short in production (minimum 32 bytes).");
  }

  if (process.env.JWT_SECRET === "ranaji_showroom_jwt_production_secret_key_2026_secured") {
    console.error("❌ [FATAL] Default development JWT_SECRET cannot be used in production.");
    throw new Error("JWT_SECRET in production must not use the default development value.");
  }
}

// Reuse mongoose connection client for MongoDB-backed session storage
const clientPromise = new Promise((resolve, reject) => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.getClient()) {
    return resolve(mongoose.connection.getClient());
  }
  mongoose.connection.once('open', () => {
    resolve(mongoose.connection.getClient());
  });
  mongoose.connection.once('error', (err) => {
    reject(err);
  });
});

const sessionStore = MongoStore.create({
  clientPromise,
  dbName: process.env.MONGO_DB_NAME || 'ranaji',
  collectionName: 'sessions',
  touchAfter: 24 * 3600
});

sessionStore.on('error', (err) => {
  console.error('❌ [SessionStore Error]:', err.message);
});

validateProductionSecrets();

const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET || (isProduction ? undefined : "ranaji_showroom_dev_session_secret_2026");

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: process.env.COOKIE_SAME_SITE || "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/collections", productRoutes); // alias for products/collections
app.use("/api/categories", categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/approvals', approvalRoutes);

// Real Dashboard Statistics Endpoint queried directly from MongoDB Atlas (Protected: Showroom Staff & Admin only)
app.get('/api/dashboard/stats', authenticate, requireStaff, async (req, res) => {
  try {
    const Product = require('./models/product');
    const Sale = require('./models/Sale');
    const Customer = require('./models/Customer');
    const Booking = require('./models/Booking');
    const Contact = require('./models/Contact');
    const Order = require('./models/Order');

    const [
      products,
      sales,
      totalCustomers,
      totalBookings,
      pendingBookings,
      totalContacts,
      unreadContacts,
      totalOrders
    ] = await Promise.all([
      Product.find().select('stock'),
      Sale.find().select('calculation.grandTotal'),
      Customer.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false }),
      Order.countDocuments()
    ]);

    const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.calculation?.grandTotal || 0), 0);
    const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const lowStockCount = products.filter((p) => (Number(p.stock) || 0) <= 3).length;

    const statsData = {
      totalProducts: products.length,
      totalStockUnits,
      lowStockCount,
      totalSalesRevenue,
      totalSalesCount: sales.length,
      totalCustomers,
      totalBookings,
      pendingBookings,
      totalContacts,
      unreadContacts,
      totalOrders
    };

    res.json({
      success: true,
      stats: statsData,
      data: statsData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({ 
    success: isDbConnected, 
    message: isDbConnected ? 'Server and database are healthy' : 'Database connection is unavailable',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    database: {
      status: isDbConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name || (process.env.MONGO_DB_NAME || 'ranaji')
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ranaji API Server - MongoDB Atlas Integrated',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      customers: '/api/customers',
      sales: '/api/sales',
      inventory: '/api/inventory',
      rentals: '/api/rentals',
      testimonials: '/api/testimonials',
      gallery: '/api/gallery',
      services: '/api/services',
      bookings: '/api/bookings',
      contacts: '/api/contacts',
      dashboardStats: '/api/dashboard/stats',
      health: '/api/health'
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const autoSeedDatabase = require('./utils/autoSeed');

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateProductionSecrets();
    await connectDB();
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction && process.env.AUTO_SEED === 'true') {
      console.log("ℹ️ AUTO_SEED is enabled in non-production. Verifying initial database fixtures...");
      await autoSeedDatabase();
    } else {
      console.log(
        isProduction
          ? "ℹ️ Auto-seeding is disabled in production to protect live database integrity."
          : "ℹ️ Auto-seeding skipped on startup (set AUTO_SEED=true in development to seed demo catalog)."
      );
    }

    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║       🎩 RANAJI API SERVER RUNNING 🎩         ║
║   Server: http://localhost:${PORT}
║   MongoDB: Connected (${mongoose.connection.name || 'ranaji'})
║   Environment: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════════════╝
      `);
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

module.exports = app;
