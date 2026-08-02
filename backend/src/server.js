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
const categoryRoutes = require("./routes/categories");

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require("./routes/products");
const testimonialRoutes = require('./routes/testimonials');
const galleryRoutes = require('./routes/gallery');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const contactRoutes = require('./routes/contacts');
const userRoutes = require('./routes/users');
const session = require('express-session');
const passport = require('passport');
// const MongoStore = require("connect-mongo");
require('./config/passport');

// Initialize app
const app = express();
app.use(helmet());
app.use(compression());
app.use(cookieParser());

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
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
  secret: process.env.SESSION_SECRET,
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


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', contactRoutes);

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
    message: 'Ranaji API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      collections: '/api/collections',
      testimonials: '/api/testimonials',
      gallery: '/api/gallery',
      services: '/api/services',
      bookings: '/api/bookings',
      contacts: '/api/contacts',
      health: '/api/health'
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║       🎩 RANAJI API SERVER RUNNING 🎩         ║
║   Server: http://localhost:${PORT}
╚════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
