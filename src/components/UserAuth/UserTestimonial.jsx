import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Send, Quote, Sparkles } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { testimonialsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserTestimonial = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestLocation, setGuestLocation] = useState('Udaipur, Rajasthan');
  const [formData, setFormData] = useState({
    content: '',
    serviceType: 'Wedding Attire'
  });

  const serviceTypes = [
    'Wedding Attire',
    'Custom Design',
    'Ready-made Purchase',
    'Alteration Service',
    'Consultation',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitName = (isAuthenticated && user?.name) ? user.name : guestName.trim();

    if (!submitName || submitName.length < 2) {
      toast.error('Please provide your name (at least 2 characters)');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please write your testimonial');
      return;
    }

    if (formData.content.length < 10) {
      toast.error('Testimonial should be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      const result = await testimonialsAPI.create({
        name: submitName,
        text: formData.content.trim(),
        content: formData.content.trim(),
        rating: rating,
        occasion: formData.serviceType,
        location: guestLocation.trim() || 'Udaipur, Rajasthan',
        userId: user?._id,
        status: 'pending',
        isActive: false
      });

      if (result.success || result.data || result.id || result._id) {
        toast.success('Thank you! Your testimonial has been submitted for royal admin approval.', {
          icon: '👑',
          duration: 5000
        });
        if (isAuthenticated) {
          navigate('/profile');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.message || 'Failed to submit testimonial');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/10 to-copper/10 border-b border-gold/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to={isAuthenticated ? '/profile' : '/'}
              className="flex items-center gap-2 text-cream/70 hover:text-gold font-body transition-colors"
            >
              <ArrowLeft size={18} />
              {isAuthenticated ? 'Back to Profile' : 'Back to Home'}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-gold font-display text-lg">RANAJI</span>
              <span className="text-cream/50 font-body">| Share Your Experience</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream/5 border border-gold/20 rounded-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Quote className="text-gold" size={28} />
            </div>
            <h1 className="font-display text-2xl text-cream mb-2">Write a Testimonial</h1>
            <p className="text-cream/50 font-body">
              Share your experience with Ranaji and help others discover our royal craftsmanship
            </p>
          </div>

          <div className="mb-6 p-4 bg-gold/10 border border-gold/20 rounded-xl flex items-start gap-3">
            <Sparkles size={18} className="text-gold shrink-0 mt-0.5" />
            <p className="text-cream/70 text-xs font-body leading-relaxed">
              New testimonials default to pending verification and will appear on the public website after admin review.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info Display / Guest Input */}
            {isAuthenticated && user ? (
              <div className="bg-cream/5 border border-gold/10 rounded-lg p-4">
                <p className="text-cream/50 font-body text-sm mb-1">Submitting as</p>
                <p className="text-cream font-body font-semibold">{user.name}</p>
                <p className="text-cream/50 font-body text-sm">{user.email}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cream font-body mb-2 text-sm">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-cream font-body mb-2 text-sm">Location / City</label>
                  <input
                    type="text"
                    value={guestLocation}
                    onChange={(e) => setGuestLocation(e.target.value)}
                    placeholder="e.g., Udaipur, Rajasthan"
                    className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-cream font-body mb-3">How would you rate your experience?</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= (hoverRating || rating)
                          ? 'fill-gold text-gold'
                          : 'text-cream/30'
                      } transition-colors`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-cream font-body">
                  {rating === 5 ? 'Excellent!' : 
                   rating === 4 ? 'Very Good' :
                   rating === 3 ? 'Good' :
                   rating === 2 ? 'Fair' : 'Poor'}
                </span>
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-cream font-body mb-3">What service did you experience?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviceTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, serviceType: type }))}
                    className={`px-4 py-3 rounded-lg border font-body text-sm transition-all ${
                      formData.serviceType === type
                        ? 'border-gold bg-gold/20 text-gold'
                        : 'border-gold/20 text-cream/70 hover:border-gold/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Testimonial Content */}
            <div>
              <label className="block text-cream font-body mb-2">Your Testimonial</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={5}
                placeholder="Tell us about your experience with Ranaji. What did you like? How was the fit and craftsmanship?"
                className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold resize-none"
                required
              />
              <p className="text-cream/40 font-body text-xs mt-2">
                Minimum 10 characters • {formData.content.length} characters written
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-gold to-copper text-night font-body font-semibold rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-night/30 border-t-night rounded-full"
                />
              ) : (
                <>
                  <Send size={18} />
                  Submit Testimonial
                </>
              )}
            </button>

            <p className="text-cream/40 font-body text-xs text-center">
              Your testimonial will be reviewed by our team before being published publicly.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UserTestimonial;
