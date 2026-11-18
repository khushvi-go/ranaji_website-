import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Calendar, 
  MessageCircle, 
  CheckCircle2, 
  Crown, 
  Navigation,
  ChevronDown,
  Sparkles,
  Car
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer/Footer';
import SectionHeading from '../components/UI/SectionHeading';
import { contactsAPI, bookingsAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const faqs = [
  {
    q: 'How early should I visit the showroom before my wedding?',
    a: 'For custom-tailored sherwanis or bridal poshaks, we recommend visiting 3 to 6 weeks in advance. For royal rentals, booking 1 to 3 weeks prior ensures your preferred ensemble is reserved.'
  },
  {
    q: 'Is trial fitting and alteration included?',
    a: 'Yes, absolutely. Every rental and bespoke purchase includes complimentary trial fitting and precision alterations by our master tailors.'
  },
  {
    q: 'Do you deliver to palace hotels and resorts in Udaipur?',
    a: 'Yes. We provide direct concierge delivery to all major palace venues, heritage hotels, and wedding venues across Udaipur (City Palace, Jagmandir, Oberoi Udaivilas, Leela Palace, Raffles, and private havelis).'
  },
  {
    q: 'Can you coordinate matching saafas and attire for the entire baraat?',
    a: 'Yes, we specialize in complete groom entourages. We can outfit 10 to 100+ family members with coordinated Mewari saafas, jodhpuri waistcoats, and traditional talwars.'
  }
];

const ContactPage = () => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('inquiry'); // 'inquiry' or 'booking'
  const [openFaq, setOpenFaq] = useState(null);

  // Inquiry Form State
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Booking Form State
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    occasion: 'wedding',
    lookingFor: 'Royal Outfit Rental',
    date: '',
    message: ''
  });
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const cleanWaNumber = (settings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
  const displayAddress = settings?.address || '24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001';
  const displayPhone = settings?.phone || '+91 98765 43210';
  const displayEmail = settings?.customerServiceEmail || settings?.email || 'info@ranajiudaipur.com';

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Ranaji Royal Wedding Showroom Surajpole Udaipur')}`;

  // Handle Inquiry Form Submission
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryData.name.trim() || inquiryData.name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }
    if (!inquiryData.email.trim() || !inquiryData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!inquiryData.message.trim() || inquiryData.message.trim().length < 5) {
      toast.error('Please provide a message or inquiry details');
      return;
    }

    setIsInquirySubmitting(true);
    try {
      await contactsAPI.create({
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        subject: inquiryData.subject || 'General Showroom Inquiry',
        message: inquiryData.message
      });

      toast.success('Your inquiry has been submitted! Our concierge will reply shortly.', { icon: '👑' });
      setInquirySuccess(true);
      setInquiryData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      toast.error(err.message || 'Unable to submit inquiry. Please try again.');
    } finally {
      setIsInquirySubmitting(false);
    }
  };

  // Handle Booking Form Submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.name.trim() || bookingData.name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }
    if (!bookingData.phone.trim() || bookingData.phone.trim().length < 8) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (!bookingData.date) {
      toast.error('Please select your appointment date');
      return;
    }

    setIsBookingSubmitting(true);
    try {
      await bookingsAPI.create({
        name: bookingData.name,
        phone: bookingData.phone,
        occasion: bookingData.occasion,
        lookingFor: bookingData.lookingFor,
        date: bookingData.date,
        message: bookingData.message || ''
      });

      toast.success('Appointment scheduled in showroom database!', { icon: '👑' });
      setBookingSuccess(true);
      setBookingData({
        name: '',
        phone: '',
        occasion: 'wedding',
        lookingFor: 'Royal Outfit Rental',
        date: '',
        message: ''
      });
    } catch (err) {
      console.error('Failed to book appointment:', err);
      toast.error(err.message || 'Unable to schedule appointment. Please try again.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <div className="bg-night text-cream min-h-screen selection:bg-gold selection:text-night">
      <Navbar />

      <main className="pt-24 md:pt-32 pb-24">
        {/* Editorial Header */}
        <section className="relative py-12 md:py-20 border-b border-gold/15 bg-gradient-to-b from-night-light/40 via-night to-night">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-body text-cream/50 mb-6">
              <Link to="/" className="hover:text-gold transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gold">Contact</span>
            </div>

            <div className="max-w-3xl">
              <span className="font-serif text-xs text-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Crown size={15} />
                <span>Udaipur Showroom & Inquiries</span>
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-cream font-light leading-tight mb-6">
                Connect with <span className="text-gold font-normal">Ranaji</span>
              </h1>
              <p className="font-body text-cream/70 text-base md:text-lg leading-relaxed">
                We invite you to visit our exclusive royal wedding showroom in Surajpole, Udaipur. 
                Schedule your VIP fitting, send an inquiry, or speak directly with our royal stylists.
              </p>
            </div>
          </div>
        </section>

        {/* Showroom Contact Information Grid */}
        <section className="py-16 bg-night border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Address */}
              <div className="p-6 rounded-2xl bg-night-light/40 border border-gold/25 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                    <MapPin size={22} />
                  </div>
                  <h4 className="font-serif text-lg text-cream font-medium mb-1">Showroom Location</h4>
                  <p className="font-body text-cream/70 text-xs leading-relaxed">
                    {displayAddress}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gold/15">
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gold hover:text-cream text-xs font-serif uppercase tracking-wider font-semibold inline-flex items-center gap-1"
                  >
                    <span>Get Directions</span>
                    <Navigation size={12} />
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="p-6 rounded-2xl bg-night-light/40 border border-gold/25 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                    <Phone size={22} />
                  </div>
                  <h4 className="font-serif text-lg text-cream font-medium mb-1">Telephone & Call</h4>
                  <p className="font-body text-cream/70 text-xs leading-relaxed">
                    Direct showroom consultation line for royal wedding inquiries and orders.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gold/15">
                  <a 
                    href={`tel:${displayPhone.replace(/\s+/g, '')}`} 
                    className="text-gold hover:text-cream text-xs font-body font-bold"
                  >
                    {displayPhone}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="p-6 rounded-2xl bg-night-light/40 border border-gold/25 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] mb-4">
                    <MessageCircle size={22} />
                  </div>
                  <h4 className="font-serif text-lg text-cream font-medium mb-1">WhatsApp Concierge</h4>
                  <p className="font-body text-cream/70 text-xs leading-relaxed">
                    Instant chat for photos, availability checks, and quick appointments.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gold/15">
                  <a 
                    href={`https://wa.me/${cleanWaNumber}?text=Hello%20Ranaji,%20I%20would%20like%20to%20inquire%20about%20your%20wedding%20collection.`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-[#25D366] hover:underline text-xs font-serif uppercase tracking-wider font-semibold inline-flex items-center gap-1"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Timings */}
              <div className="p-6 rounded-2xl bg-night-light/40 border border-gold/25 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                    <Clock size={22} />
                  </div>
                  <h4 className="font-serif text-lg text-cream font-medium mb-1">Showroom Timings</h4>
                  <p className="font-body text-cream/70 text-xs leading-relaxed">
                    {settings?.openingHours || 'Monday – Sunday: 10:00 AM – 9:00 PM'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gold/15 text-xs text-cream/50 font-body flex items-center gap-1.5">
                  <Car size={13} className="text-gold" />
                  <span>Valet & Parking Available</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Dual Mode Forms Section */}
        <section className="py-20 bg-night">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-gold/30 bg-night-light/70 p-8 sm:p-12 shadow-2xl">
              
              {/* Form Selector Tabs */}
              <div className="flex rounded-2xl bg-night p-1.5 border border-gold/20 mb-8 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiry')}
                  className={`flex-1 py-3 px-4 rounded-xl font-serif text-xs uppercase tracking-widest transition-all font-semibold ${
                    activeTab === 'inquiry'
                      ? 'bg-gold text-night shadow-md'
                      : 'text-cream/70 hover:text-cream'
                  }`}
                >
                  Send Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('booking')}
                  className={`flex-1 py-3 px-4 rounded-xl font-serif text-xs uppercase tracking-widest transition-all font-semibold ${
                    activeTab === 'booking'
                      ? 'bg-gold text-night shadow-md'
                      : 'text-cream/70 hover:text-cream'
                  }`}
                >
                  Book Appointment
                </button>
              </div>

              {/* Tab 1: General Inquiry Form */}
              {activeTab === 'inquiry' && (
                <div>
                  <div className="text-center mb-8">
                    <h3 className="font-serif text-2xl text-cream font-medium">Showroom Enquiry & Custom Orders</h3>
                    <p className="font-body text-cream/60 text-xs sm:text-sm mt-1">
                      Have a query about sherwanis, bridal poshaks, pricing, or destination wedding packages? Send us a message.
                    </p>
                  </div>

                  {inquirySuccess ? (
                    <div className="text-center py-10 px-6 rounded-2xl bg-gold/10 border border-gold/40 space-y-4">
                      <CheckCircle2 size={44} className="text-gold mx-auto" />
                      <h4 className="font-serif text-xl text-cream">Thank You for Reaching Out</h4>
                      <p className="text-cream/70 font-body text-sm max-w-md mx-auto">
                        Your message has been safely recorded in our showroom system. Our concierge team will reply within 24 hours.
                      </p>
                      <button
                        onClick={() => setInquirySuccess(false)}
                        className="px-6 py-2.5 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={inquiryData.name}
                            onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                            placeholder="e.g. Kunwar Pratap Singh"
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={inquiryData.email}
                            onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                            placeholder="name@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={inquiryData.phone}
                            onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Subject
                          </label>
                          <input
                            type="text"
                            value={inquiryData.subject}
                            onChange={(e) => setInquiryData({ ...inquiryData, subject: e.target.value })}
                            placeholder="e.g. Wedding Sherwani Rental Inquiry"
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                          Your Message *
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={inquiryData.message}
                          onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                          placeholder="Tell us about your wedding dates, required garments, and any special requests..."
                          className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isInquirySubmitting}
                        className="w-full py-4 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold shadow-xl hover:bg-copper transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isInquirySubmitting ? (
                          <span>Submitting Inquiry...</span>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Send Showroom Message</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Tab 2: Appointment Booking Form */}
              {activeTab === 'booking' && (
                <div>
                  <div className="text-center mb-8">
                    <h3 className="font-serif text-2xl text-cream font-medium">Reserve a VIP Fitting Session</h3>
                    <p className="font-body text-cream/60 text-xs sm:text-sm mt-1">
                      Enjoy a dedicated trial room with complimentary Mewari tea and personal styling guidance.
                    </p>
                  </div>

                  {bookingSuccess ? (
                    <div className="text-center py-10 px-6 rounded-2xl bg-gold/10 border border-gold/40 space-y-4">
                      <CheckCircle2 size={44} className="text-gold mx-auto" />
                      <h4 className="font-serif text-xl text-cream">Appointment Slot Reserved!</h4>
                      <p className="text-cream/70 font-body text-sm max-w-md mx-auto">
                        Your appointment has been registered in the Ranaji Showroom calendar. We look forward to welcoming you at Surajpole, Udaipur.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <a
                          href={`https://wa.me/${cleanWaNumber}?text=Hello%20Ranaji,%20I%20just%20booked%20an%20appointment%20online.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 rounded-xl bg-[#25D366] text-white font-serif text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={15} />
                          <span>WhatsApp Confirmation</span>
                        </a>
                        <button
                          onClick={() => setBookingSuccess(false)}
                          className="px-6 py-2.5 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold"
                        >
                          Book Another
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={bookingData.name}
                            onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                            placeholder="e.g. Digvijay Singh"
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Contact Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={bookingData.phone}
                            onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Occasion
                          </label>
                          <select
                            value={bookingData.occasion}
                            onChange={(e) => setBookingData({ ...bookingData, occasion: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          >
                            <option value="wedding">Royal Wedding (Groom/Bride)</option>
                            <option value="sangeet">Sangeet / Cocktails</option>
                            <option value="reception">Reception</option>
                            <option value="engagement">Engagement Ceremony</option>
                            <option value="baraat">Baraat Entourage</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Looking For
                          </label>
                          <select
                            value={bookingData.lookingFor}
                            onChange={(e) => setBookingData({ ...bookingData, lookingFor: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          >
                            <option value="Royal Outfit Rental">Royal Outfit Rental</option>
                            <option value="Bespoke Tailoring">Bespoke Master Tailoring</option>
                            <option value="Custom Rajputi Outfit">Custom Rajputi Poshak</option>
                            <option value="Saafa Tying Service">Saafa / Pagri Coordination</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                            Appointment Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={bookingData.date}
                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream text-sm font-body focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                          Notes or Number of Guests
                        </label>
                        <textarea
                          rows={3}
                          value={bookingData.message}
                          onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                          placeholder="Let us know how many members are visiting or any specific preferences..."
                          className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isBookingSubmitting}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-gold via-copper to-gold text-night font-serif text-xs uppercase tracking-widest font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isBookingSubmitting ? (
                          <span>Reserving Appointment in System...</span>
                        ) : (
                          <>
                            <Calendar size={16} />
                            <span>Reserve Fitting Session</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Showroom FAQ Accordion */}
        <section className="py-16 bg-night-light/20 border-t border-gold/15">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              subtitle="Showroom Guidance"
              title="Frequently Asked Questions"
            />

            <div className="mt-12 space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gold/20 bg-night overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif text-base text-cream hover:text-gold transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-xs sm:text-sm font-body text-cream/70 leading-relaxed border-t border-gold/10 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
