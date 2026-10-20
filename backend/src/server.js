require('dotenv').config();
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const express = require('express');
const cors = require('cors');
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

// Initialize app
const app = express();
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

app.use(session({
  secret: process.env.SESSION_SECRET || 'ranaji_showroom_secure_session_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
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

// Real Dashboard Statistics Endpoint queried directly from MongoDB Atlas
app.get('/api/dashboard/stats', async (req, res) => {
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
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
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
    await connectDB();
    await autoSeedDatabase();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║       🎩 RANAJI API SERVER RUNNING 🎩         ║
║   Server: http://localhost:${PORT}
║   MongoDB: Connected to Atlas (ranaji)        ║
╚════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
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
