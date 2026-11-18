const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  showroomName: {
    type: String,
    default: 'Ranaji Udaipur',
    trim: true
  },
  tagline: {
    type: String,
    default: 'Royal Rajasthani Wedding Wardrobe & Tailoring',
    trim: true
  },
  address: {
    type: String,
    default: '24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001',
    trim: true
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
    trim: true
  },
  whatsappNumber: {
    type: String,
    default: '919876543210',
    trim: true
  },
  email: {
    type: String,
    default: 'contact@ranaji.com',
    trim: true
  },
  openingHours: {
    type: String,
    default: 'Mon – Sun: 10:00 AM – 9:00 PM',
    trim: true
  },
  googleMapsUrl: {
    type: String,
    default: 'https://maps.google.com/?q=Surajpole+Udaipur',
    trim: true
  },
  gstNumber: {
    type: String,
    default: '08AAAAA0000A1Z5',
    trim: true
  },
  stateCode: {
    type: String,
    default: '08',
    trim: true
  },
  invoicePrefix: {
    type: String,
    default: 'RNJ',
    trim: true
  },
  invoiceNotes: {
    type: String,
    default: 'All royal ensembles are handcrafted in Udaipur. Retain this invoice for trial fittings and authorized exchanges.',
    trim: true
  },
  customerServiceEmail: {
    type: String,
    default: 'contact@ranaji.com',
    trim: true
  },
  instagramUrl: {
    type: String,
    default: 'https://www.instagram.com/ranaji_udaipur',
    trim: true
  },
  facebookUrl: {
    type: String,
    default: 'https://www.facebook.com/share/18PhEG4c3J/',
    trim: true
  },
  maxCashierDiscountPercent: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  maxCashierDiscountAmount: {
    type: Number,
    default: 2000,
    min: 0
  },
  maxInventoryWriteOffQty: {
    type: Number,
    default: 2,
    min: 0
  },
  requireApprovalForRefunds: {
    type: Boolean,
    default: true
  },
  requireApprovalForWriteOffs: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
