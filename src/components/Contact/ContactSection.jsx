import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  MapPin, 
  Phone, 
  Clock, 
  MessageCircle, 
  Mail, 
  Send, 
  Calendar, 
  CheckCircle, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import GoldButton from '../UI/GoldButton';
import { contactsAPI, bookingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ContactSection = () => {
  const [activeTab, setActiveTab] = useState('inquiry'); // 'inquiry' or 'booking'

  // State for Contact / Inquiry Form
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  // State for Appointment Booking Form
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors: bookingErrors }, reset: resetBooking } = useForm();

  // Handle Contact / Inquiry submission
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryError('');

    // Spam honeypot
    if (honeypot) {
      setInquiryError('Spam submission detected.');
      return;
    }

    if (!inquiryName.trim() || inquiryName.trim().length < 2) {
      setInquiryError('Please enter your full name (minimum 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inquiryEmail.trim() || !emailRegex.test(inquiryEmail.trim())) {
      setInquiryError('Please enter a valid email address.');
      return;
    }

    if (!inquiryMessage.trim() || inquiryMessage.trim().length < 5) {
      setInquiryError('Please write your message or inquiry (minimum 5 characters).');
      return;
    }

    setIsInquirySubmitting(true);
    try {
      const payload = {
        name: inquiryName.trim(),
        email: inquiryEmail.trim().toLowerCase(),
        phone: inquiryPhone.trim(),
        subject: inquirySubject.trim() || 'General Inquiry',
        message: inquiryMessage.trim()
      };

      const res = await contactsAPI.create(payload);

      if (res.success || res.contact || res.data || res.id || res._id) {
        setInquirySuccess(true);
        toast.success('Your message has been delivered to Ranaji showroom!', {
          icon: '👑',
          duration: 5000
        });

        // Reset form inputs
        setInquiryName('');
        setInquiryEmail('');
        setInquiryPhone('');
        setInquirySubject('');
        setInquiryMessage('');
      } else {
        setInquiryError(res.message || 'Failed to send inquiry. Please try again.');
        toast.error(res.message || 'Failed to send inquiry.');
      }
    } catch (err) {
      setInquiryError(err.message || 'Network error occurred. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsInquirySubmitting(false);
    }
  };

  // Handle Showroom Booking submission
  const onBookingSubmit = async (data) => {
    setIsBookingSubmitting(true);
    
    // Format the message for WhatsApp
    const message = encodeURIComponent(
      `*Royal Appointment Request - Ranaji*\n\n` +
      `👤 *Name:* ${data.name}\n` +
      `📞 *Phone:* ${data.phone}\n` +
      `🎉 *Occasion:* ${data.occasion}\n` +
      `👔 *Looking For:* ${data.lookingFor}\n` +
      `${data.date ? `📅 *Preferred Date:* ${data.date}\n` : ''}` +
      `${data.message ? `\n💬 *Message:*\n${data.message}` : ''}`
    );
    
    const whatsappUrl = `https://wa.me/919876543210?text=${message}`;
    
    try {
      await bookingsAPI.create({
        name: data.name,
        phone: data.phone,
        occasion: data.occasion || 'wedding',
        lookingFor: data.lookingFor || 'both',
        date: data.date,
        message: data.message || ''
      });
      toast.success('Appointment booked successfully in showroom system!', {
        icon: '👑'
      });
    } catch (err) {
      console.error('Failed to save booking to database:', err);
      toast.error('Unable to save appointment to database: ' + err.message);
      setIsBookingSubmitting(false);
      return;
    }

    // Open WhatsApp in new tab for direct consultation
    window.open(whatsappUrl, '_blank');
    
    setIsBookingSubmitting(false);
    setBookingSuccess(true);
    resetBooking();
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 98765 43210',
      href: 'tel:+919876543210'
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: 'contact@ranajiwedding.com',
      href: 'mailto:contact@ranajiwedding.com'
    },
    {
      icon: Clock,
      title: 'Opening Hours',
      content: 'Mon – Sun: 10:00 AM – 9:00 PM'
    }
  ];

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Get in Touch"
          title="Connect with Ranaji"
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Contact Form with Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            {/* Form Mode Selector Tabs */}
            <div className="flex rounded-xl bg-cream/5 p-1 border border-gold/20 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inquiry');
                  setInquirySuccess(false);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-body text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'inquiry'
                    ? 'bg-gold text-night shadow-md font-semibold'
                    : 'text-cream/70 hover:text-cream'
                }`}
              >
                <Mail size={16} />
                <span>Send Inquiry / Message</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('booking')}
                className={`flex-1 py-3 px-4 rounded-lg font-body text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'booking'
                    ? 'bg-gold text-night shadow-md font-semibold'
                    : 'text-cream/70 hover:text-cream'
                }`}
              >
                <Calendar size={16} />
                <span>Book Appointment</span>
              </button>
            </div>

            {/* TAB 1: Contact / Inquiry Form */}
            {activeTab === 'inquiry' && (
              <AnimatePresence mode="wait">
                {inquirySuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 bg-cream/5 border border-gold/30 rounded-2xl text-center space-y-4 my-auto"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                      <CheckCircle size={36} />
                    </div>
                    <h3 className="font-display text-2xl text-cream">Royal Inquiry Received!</h3>
                    <p className="text-cream/70 font-body text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out to Ranaji. Your message has been saved in our showroom database in MongoDB Atlas. Our royal concierge team will get in touch with you shortly.
                    </p>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setInquirySuccess(false)}
                        className="px-6 py-2.5 bg-gold/20 hover:bg-gold text-gold hover:text-night border border-gold/40 rounded-lg text-sm font-body transition-colors"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleInquirySubmit}
                    className="space-y-5 bg-cream/5 border border-gold/15 p-6 sm:p-8 rounded-2xl"
                  >
                    {inquiryError && (
                      <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-lg font-body flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{inquiryError}</span>
                      </div>
                    )}

                    {/* Hidden Honeypot for Spam Prevention */}
                    <input
                      type="text"
                      name="bot_field_honey"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      style={{ display: 'none' }}
                      tabIndex="-1"
                      autoComplete="off"
                    />

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-body text-cream/70 text-sm mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label className="block font-body text-cream/70 text-sm mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-body text-cream/70 text-sm mb-1.5">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          value={inquiryPhone}
                          onChange={(e) => setInquiryPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label className="block font-body text-cream/70 text-sm mb-1.5">
                          Subject (Optional)
                        </label>
                        <input
                          type="text"
                          value={inquirySubject}
                          onChange={(e) => setInquirySubject(e.target.value)}
                          className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg"
                          placeholder="e.g., Groom Sherwani Rental"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block font-body text-cream/70 text-sm">
                          Your Message / Inquiry *
                        </label>
                        <span className="text-cream/40 text-xs font-body">
                          {inquiryMessage.length}/2000
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        maxLength={2000}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg resize-none"
                        placeholder="Tell us about your occasion, attire preferences, sizing, or any showroom questions..."
                      />
                    </div>

                    <GoldButton
                      type="submit"
                      disabled={isInquirySubmitting}
                      className="w-full md:w-auto"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isInquirySubmitting ? (
                          'Delivering to Showroom...'
                        ) : (
                          <>
                            Send Royal Inquiry
                            <Send size={16} />
                          </>
                        )}
                      </span>
                    </GoldButton>
                  </motion.form>
                )}
              </AnimatePresence>
            )}

            {/* TAB 2: Book Appointment Form */}
            {activeTab === 'booking' && (
              <motion.form
                key="booking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onBookingSubmit)}
                className="space-y-6 bg-cream/5 border border-gold/15 p-6 sm:p-8 rounded-2xl"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-body text-cream/70 text-sm mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg"
                      placeholder="Your name"
                    />
                    {bookingErrors.name && (
                      <p className="text-crimson text-xs mt-1">{bookingErrors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-body text-cream/70 text-sm mb-2">
                      Phone Number *
                    </label>
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      type="tel"
                      className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg"
                      placeholder="+91 98765 43210"
                    />
                    {bookingErrors.phone && (
                      <p className="text-crimson text-xs mt-1">{bookingErrors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-body text-cream/70 text-sm mb-2">
                      Occasion *
                    </label>
                    <select
                      {...register('occasion', { required: 'Occasion is required' })}
                      className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg [&>option]:bg-night [&>option]:text-cream"
                    >
                      <option value="" className="bg-night text-cream">Select occasion</option>
                      <option value="wedding" className="bg-night text-cream">Royal Wedding</option>
                      <option value="engagement" className="bg-night text-cream">Engagement Ceremony</option>
                      <option value="baarat" className="bg-night text-cream">Royal Baraat Ensemble</option>
                      <option value="festival" className="bg-night text-cream">Festival / Celebration</option>
                      <option value="other" className="bg-night text-cream">Other</option>
                    </select>
                    {bookingErrors.occasion && (
                      <p className="text-crimson text-xs mt-1">{bookingErrors.occasion.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-body text-cream/70 text-sm mb-2">
                      Looking For *
                    </label>
                    <select
                      {...register('lookingFor', { required: 'This field is required' })}
                      className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg [&>option]:bg-night [&>option]:text-cream"
                    >
                      <option value="" className="bg-night text-cream">Select option</option>
                      <option value="purchase" className="bg-night text-cream">Purchase</option>
                      <option value="rental" className="bg-night text-cream">Rental</option>
                      <option value="both" className="bg-night text-cream">Both Purchase & Rental</option>
                    </select>
                    {bookingErrors.lookingFor && (
                      <p className="text-crimson text-xs mt-1">{bookingErrors.lookingFor.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-body text-cream/70 text-sm mb-2">
                    Preferred Visit Date
                  </label>
                  <input
                    {...register('date')}
                    type="date"
                    className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-body text-cream/70 text-sm mb-2">
                    Message / Special Requests
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream text-sm rounded-lg resize-none"
                    placeholder="Tell us about specific outfits or custom requirements..."
                  />
                </div>

                <GoldButton
                  type="submit"
                  disabled={isBookingSubmitting}
                  className="w-full md:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isBookingSubmitting ? (
                      'Opening WhatsApp...'
                    ) : bookingSuccess ? (
                      'Appointment Booked!'
                    ) : (
                      <>
                        Book & Open WhatsApp
                        <MessageCircle size={18} />
                      </>
                    )}
                  </span>
                </GoldButton>
              </motion.form>
            )}
          </motion.div>

          {/* Right - Store Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="flex gap-3 p-5 bg-cream/5 border border-gold/10 rounded-xl"
                >
                  <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-lg flex items-center justify-center shrink-0">
                    <info.icon className="text-gold" size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-cream mb-1">{info.title}</h3>
                    {info.href ? (
                      <a 
                        href={info.href}
                        className="font-body text-xs text-cream/70 hover:text-gold transition-colors block break-words"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="font-body text-xs text-cream/70 leading-relaxed">{info.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Map */}
            <motion.a
              href="https://maps.app.goo.gl/X6WTs63sTx9NGqje9"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-video bg-cream/5 border border-gold/15 rounded-xl overflow-hidden block group shadow-lg"
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-night/50 group-hover:bg-night/30 transition-colors z-10">
                <div className="text-center">
                  <MapPin size={40} className="text-gold mx-auto mb-2 animate-bounce" />
                  <p className="text-cream font-body text-sm font-medium">Click to View Showroom on Google Maps</p>
                </div>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d17255.861809850703!2d73.72856411770356!3d24.603063198204225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967ef4b3f9e2db1%3A0x84791dcf81eddb9d!2sRanaji%20Wedding%20Showroom!5e0!3m2!1sen!2sin!4v1772596479180!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) sepia(20%) brightness(0.8)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ranaji Location"
              />
            </motion.a>

            {/* WhatsApp Direct Chat CTA */}
            <motion.a
              href="https://wa.me/919876543210?text=Hello%20Ranaji,%20I%20would%20like%20to%20inquire%20about%20your%20wedding%20collection."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#25D366] text-white font-body font-medium tracking-wide rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-emerald-950/20 text-sm"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <MessageCircle size={20} />
              Instant WhatsApp Consultation (+91 98765 43210)
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
