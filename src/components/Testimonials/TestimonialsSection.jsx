import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Star, Quote, PenTool, X, CheckCircle, Sparkles } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import { useAdmin } from '../../context/AdminContext';
import { testimonialsAPI } from '../../services/api';
import toast from 'react-hot-toast';

import 'swiper/css';
import 'swiper/css/pagination';

const CustomerReviewModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [occasion, setOccasion] = useState('');
  const [location, setLocation] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ratingDescriptions = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good Service',
    4: 'Very Good Royal Attire',
    5: 'Exceptional Maharaja Experience'
  };

  const resetForm = () => {
    setName('');
    setRating(5);
    setHoverRating(0);
    setText('');
    setOccasion('');
    setLocation('');
    setHoneypot('');
    setErrorMessage('');
    setSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Spam honeypot
    if (honeypot) {
      setErrorMessage('Submission rejected as spam.');
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!text.trim() || text.trim().length < 10) {
      setErrorMessage('Please share a few words about your experience (minimum 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        rating,
        text: text.trim(),
        occasion: occasion.trim() || 'Royal Patron Experience',
        location: location.trim() || 'Udaipur, Rajasthan',
        status: 'pending',
        isActive: false
      };

      const res = await testimonialsAPI.create(payload);

      if (res.success || res.data || res.id || res._id) {
        setSubmitted(true);
        toast.success('Royal review submitted! It will appear once approved by our team.', {
          icon: '👑',
          duration: 5000
        });
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || 'Unable to submit review. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error while submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-night/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-night border border-gold/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-gold/15 my-8"
        >
          {/* Header */}
          <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-gradient-to-r from-gold/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                <PenTool size={20} />
              </div>
              <div>
                <h3 className="font-display text-xl text-cream">Share Your Royal Experience</h3>
                <p className="text-xs text-cream/50 font-body">Ranaji Wedding Showroom, Udaipur</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-cream/40 hover:text-cream transition-colors p-1"
            >
              <X size={22} />
            </button>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                <CheckCircle size={36} />
              </div>
              <h4 className="font-display text-2xl text-cream">Dhanyavaad, {name}!</h4>
              <p className="text-cream/70 font-body text-sm leading-relaxed max-w-sm mx-auto">
                Your testimonial has been submitted to our showroom records in MongoDB Atlas. To maintain royal authenticity, new submissions appear publicly after verification by our administration.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-8 py-3 bg-gold text-night font-body font-semibold rounded-lg hover:bg-copper transition-colors"
                >
                  Return to Website
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {errorMessage && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-lg font-body">
                  {errorMessage}
                </div>
              )}

              {/* Notice badge */}
              <div className="p-3 bg-gold/10 border border-gold/20 rounded-lg flex items-start gap-2.5">
                <Sparkles size={16} className="text-gold shrink-0 mt-0.5" />
                <p className="text-cream/70 text-xs font-body leading-relaxed">
                  Your review will be saved to our showroom records and will be published on the website after royal admin approval.
                </p>
              </div>

              {/* Hidden honeypot field for anti-spam */}
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex="-1"
                autoComplete="off"
              />

              {/* Star Rating */}
              <div>
                <label className="block text-cream/80 text-sm font-body mb-2 font-medium">
                  Star Rating *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-gold transition-transform hover:scale-115 focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={`${
                            star <= (hoverRating || rating)
                              ? 'text-gold fill-gold'
                              : 'text-cream/20'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-gold/80 text-xs font-body ml-2 font-medium">
                    {ratingDescriptions[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-cream/80 text-sm font-body mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors text-sm"
                  placeholder="e.g., Kunwar Vikramaditya Singh"
                />
              </div>

              {/* Occasion & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cream/70 text-xs font-body mb-1.5">
                    Occasion / Attire (Optional)
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-4 py-2 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors text-sm"
                    placeholder="e.g., Royal Groom - Dec 2026"
                  />
                </div>
                <div>
                  <label className="block text-cream/70 text-xs font-body mb-1.5">
                    City / Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors text-sm"
                    placeholder="e.g., Udaipur, Rajasthan"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-cream/80 text-sm font-body">
                    Your Review & Experience *
                  </label>
                  <span className="text-cream/40 text-xs font-body">
                    {text.length}/1000
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors text-sm resize-none"
                  placeholder="Tell us about the craftsmanship, fit of your attire, or experience at our showroom..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-5 py-2.5 border border-gold/30 text-cream rounded-lg hover:bg-cream/5 transition-colors font-body text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-2.5 bg-gold text-night font-body font-semibold rounded-lg hover:bg-copper transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Submitting to Atlas...' : 'Submit Royal Review'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const TestimonialsSection = () => {
  const swiperRef = useRef(null);
  const { testimonials, loading, refreshData } = useAdmin();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Only show approved/active testimonials on public carousel
  const publicTestimonials = testimonials.filter((t) => {
    const isApproved = t.status === 'approved' || (t.status === undefined && t.isActive !== false);
    return isApproved;
  });

  return (
    <section className="relative py-24 md:py-32" style={{ backgroundColor: '#1E140A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            subtitle="What Our Clients Say"
            title="Royal Words"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:mb-12 flex justify-start md:justify-end"
          >
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold/15 hover:bg-gold text-gold hover:text-night border border-gold/40 rounded-full font-body font-semibold text-sm transition-all duration-300 shadow-lg shadow-gold/5"
            >
              <PenTool size={16} />
              <span>Share Your Royal Experience</span>
            </button>
          </motion.div>
        </div>

        {/* Testimonials Carousel */}
        {loading && publicTestimonials.length === 0 ? (
          <div className="mt-16 text-center text-gold/60 font-body py-12">
            Loading patron testimonials from MongoDB Atlas...
          </div>
        ) : publicTestimonials.length === 0 ? (
          <div className="mt-16 text-center text-cream/50 font-body py-12 bg-cream/5 border border-gold/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <Quote className="mx-auto text-gold/40 mb-3" size={36} />
            <p className="text-cream text-lg font-serif mb-2">Be Our First Patron Reviewer</p>
            <p className="text-cream/60 font-body text-sm mb-6">
              Share your royal wedding or ceremony experience with Ranaji Udaipur.
            </p>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-6 py-2.5 bg-gold text-night font-body font-medium rounded-lg hover:bg-copper transition-colors text-sm"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="mt-12">
            <Swiper
              ref={swiperRef}
              modules={[Pagination, Autoplay]}
              spaceBetween={32}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 6000, pauseOnMouseEnter: true }}
              breakpoints={{
                768: { slidesPerView: 2 },
              }}
              className="!pb-14"
            >
              {publicTestimonials.map((testimonial, idx) => (
                <SwiperSlide key={testimonial.id || testimonial._id || idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative h-full"
                  >
                    <div className="relative bg-night/30 backdrop-blur-sm p-8 h-full border border-gold/20 rounded-xl">
                      {/* Quote Icon */}
                      <Quote 
                        className="absolute top-6 right-6 text-gold/30" 
                        size={48} 
                      />

                      {/* Stars */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(Number(testimonial.rating) || 5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={18} 
                            className="fill-gold text-gold" 
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <blockquote className="font-serif text-lg text-cream/90 italic leading-relaxed mb-8">
                        &ldquo;{testimonial.text || testimonial.content}&rdquo;
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gold-gradient flex items-center justify-center text-night font-display font-bold rounded-full">
                          {testimonial.avatar || testimonial.name?.slice(0, 2).toUpperCase() || 'RP'}
                        </div>
                        <div>
                          <p className="font-body font-medium text-cream">
                            {testimonial.name}
                          </p>
                          <p className="font-body text-sm text-cream/60">
                            {testimonial.occasion}
                          </p>
                          <p className="font-body text-xs text-gold mt-0.5">
                            {testimonial.location}
                          </p>
                        </div>
                      </div>

                      {/* Decorative Bottom Border */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <div className="w-12 h-px bg-gold/30" />
                        <div className="w-2 h-2 rotate-45 bg-gold/50" />
                        <div className="w-12 h-px bg-gold/30" />
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          <div className="text-center">
            <p className="font-serif text-4xl text-gold font-light">4.9</p>
            <div className="flex gap-0.5 justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className="fill-gold text-gold" 
                />
              ))}
            </div>
            <p className="font-body text-xs text-cream/60 mt-1">Google Rating</p>
          </div>
          <div className="h-12 w-px bg-gold/20 hidden md:block" />
          <div className="text-center">
            <p className="font-serif text-4xl text-gold font-light">500+</p>
            <p className="font-body text-xs text-cream/60 mt-1">Royal Weddings Outfitted</p>
          </div>
          <div className="h-12 w-px bg-gold/20 hidden md:block" />
          <div className="text-center">
            <p className="font-serif text-4xl text-gold font-light">Mewar</p>
            <p className="font-body text-xs text-cream/60 mt-1">Udaipur Flagship Showroom</p>
          </div>
        </motion.div>
      </div>

      <CustomerReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={refreshData}
      />
    </section>
  );
};

export default TestimonialsSection;
