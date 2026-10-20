const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  occasion: {
    type: String,
    trim: true,
    maxlength: [100, 'Occasion cannot exceed 100 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  text: {
    type: String,
    required: [true, 'Testimonial text is required'],
    maxlength: [1000, 'Testimonial cannot exceed 1000 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

testimonialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

testimonialSchema.virtual('userId').get(function() {
  return this.user ? (this.user._id ? this.user._id.toString() : this.user.toString()) : null;
});

testimonialSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.user && ret.user._id) {
      ret.userId = ret.user._id.toString();
    } else if (ret.user) {
      ret.userId = ret.user.toString();
    }
    return ret;
  }
});

testimonialSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
