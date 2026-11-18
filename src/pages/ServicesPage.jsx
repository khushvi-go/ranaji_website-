import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shirt, 
  Ruler, 
  Users, 
  Crown, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  Send,
  Scissors
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer/Footer';
import SectionHeading from '../components/UI/SectionHeading';
import { bookingsAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const servicePillars = [
  {
    icon: Shirt,
    title: 'Royal Outfit Rentals',
    subtitle: '3 to 7 Days Rental Duration',
    description: 'Wear an authentic royal wedding ensemble without the commitment of full purchase. We offer hand-embroidered sherwanis, bridal poshaks, safas, and jewelry.',
    features: [
      'Complimentary pre-wedding trial fitting',
      'Hygienic eco-steam cleaning included',
      'Flexible 3, 5, and 7-day rental windows',
      'Complete matching accessories bundle available'
    ],
    pricing: 'Starts from ₹3,500 / rental'
  },
  {
    icon: Ruler,
    title: 'Bespoke Master Tailoring',
    subtitle: 'Precision Handcrafted Cuts',
    description: 'Our in-house master tailors have dressed generations of Mewar royalty. We craft each garment to sculpt the perfect posture and regal silhouette.',
    features: [
      'In-person master measurement session',
      'Adjustable armholes and inner comfort lining',
      'Express alteration turnaround for wedding dates',
      'Final trial inspection before delivery'
    ],
    pricing: 'Included with all custom & purchased garments'
  },
  {
    icon: Scissors,
    title: 'Custom Rajputi Outfits',
    subtitle: 'Heirloom Creations From Scratch',
    description: 'Commission a one-of-a-kind ensemble. Choose from our pure raw silks, velvets, and banarasi brocades, customized with your wedding color scheme.',
    features: [
      'Authentic Zardozi, Gota Patti, & Aari work',
      'Personal fabric and swatch consultation',
      'Coordinated groom and bride matching motifs',
      'Handcrafted antique brass or gold buttons'
    ],
    pricing: 'Custom quotation based on fabric and embroidery'
  },
  {
    icon: Users,
    title: 'Baraat & Family Styling',
    subtitle: 'Group Coordination (10–100+ Guests)',
    description: 'Ensure the entire wedding procession looks uniformly majestic. We provide coordinated royal safas, matching jodhpuri coats, and accessories.',
    features: [
      'On-site professional saafa tying specialists',
      'Uniform color themes matching the groom',
      'Coordinated pocket squares and malas',
      'Bulk packages for wedding parties'
    ],
    pricing: 'Tiered group rates from ₹700 / person'
  }
];

const workflowSteps = [
  {
    step: '01',
    title: 'Showroom Consultation',
    desc: 'Visit our Surajpole showroom or schedule a virtual appointment to discuss your wedding theme, colors, and dates.'
  },
  {
    step: '02',
    title: 'Design & Silhouette Selection',
    desc: 'Browse our exclusive showroom samples, feel the pure silks and velvets, and choose between rental or custom creation.'
  },
  {
    step: '03',
    title: 'Master Fitting & Trial',
    desc: 'Our master tailor takes precise measurements and conducts a trial fitting to guarantee ease of movement and comfort.'
  },
  {
    step: '04',
    title: 'Wedding-Day Delivery',
    desc: 'Your ensemble is steam-pressed, packaged in our signature royal garment bag, and delivered ready for your coronation day.'
  }
];

const ServicesPage = () => {
  const { settings } = useSettings();

  // Booking Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    occasion: 'wedding',
    service: 'Bespoke Tailoring',
    date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (!formData.date) {
      toast.error('Please select your preferred appointment date');
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingsAPI.create({
        name: formData.name,
        phone: formData.phone,
        occasion: formData.occasion,
        lookingFor: formData.service,
        date: formData.date,
        message: formData.message || `Booked service: ${formData.service}`
      });

      toast.success('Your royal appointment request has been confirmed!', { icon: '👑' });
      setBookingSuccess(true);
      setFormData({
        name: '',
        phone: '',
        occasion: 'wedding',
        service: 'Bespoke Tailoring',
        date: '',
        message: ''
      });
    } catch (err) {
      console.error('Failed to create booking:', err);
      toast.error(err.message || 'Unable to schedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              <span className="text-gold">Services</span>
            </div>

            <div className="max-w-3xl">
              <span className="font-serif text-xs text-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Crown size={15} />
                <span>Showroom Services & Royal Atelier</span>
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-cream font-light leading-tight mb-6">
                Tailoring, Rentals & <span className="text-gold font-normal">Custom Outfits</span>
              </h1>
              <p className="font-body text-cream/70 text-base md:text-lg leading-relaxed">
                Ranaji provides a full spectrum of royal wardrobe services in Udaipur. Whether renting a heritage sherwani, 
                commissioning bespoke bridal couture, or outfitting an entire wedding entourage, our master craftsmen are at your service.
              </p>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars Grid */}
        <section className="py-20 bg-night border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              subtitle="Exceptional Showroom Offerings"
              title="Our Signature Services"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {servicePillars.map((srv, idx) => {
                const IconComponent = srv.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 sm:p-10 rounded-2xl bg-night-light/50 border border-gold/25 hover:border-gold/60 transition-all duration-300 flex flex-col justify-between shadow-xl group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                          <IconComponent size={26} />
                        </div>
                        <span className="font-body text-xs text-gold/80 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                          {srv.subtitle}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl text-cream font-medium mb-3">{srv.title}</h3>
                      <p className="font-body text-cream/70 text-sm leading-relaxed mb-6">
                        {srv.description}
                      </p>

                      <div className="space-y-2.5 mb-6 pt-4 border-t border-gold/15">
                        {srv.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs text-cream/80 font-body">
                            <CheckCircle2 size={15} className="text-gold shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gold/15 flex items-center justify-between">
                      <span className="font-body text-xs text-copper font-medium">{srv.pricing}</span>
                      <a
                        href="#book-appointment"
                        className="text-xs font-serif uppercase tracking-widest text-gold hover:text-cream flex items-center gap-1.5 transition-colors font-bold"
                      >
                        <span>Book Service</span>
                        <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow / How It Works */}
        <section className="py-20 bg-night-light/20 border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              subtitle="The Royal Experience"
              title="How Our Service Works"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {workflowSteps.map((step, idx) => (
                <div 
                  key={idx}
                  className="relative p-6 rounded-2xl bg-night border border-gold/20 flex flex-col justify-between"
                >
                  <div>
                    <span className="font-serif text-3xl text-gold/30 font-bold block mb-3">{step.step}</span>
                    <h4 className="font-serif text-lg text-cream font-medium mb-2">{step.title}</h4>
                    <p className="font-body text-cream/60 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Appointment Booking Form Section */}
        <section id="book-appointment" className="py-20 bg-night">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-gold/30 bg-night-light/70 p-8 sm:p-12 shadow-2xl">
              
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="font-serif text-xs text-gold uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
                  <Calendar size={15} />
                  <span>VIP Fitting & Tailoring</span>
                </span>
                <h3 className="font-serif text-3xl text-cream font-medium">Book Your Showroom Appointment</h3>
                <p className="font-body text-cream/60 text-xs sm:text-sm mt-2">
                  Reserve a dedicated consultation room and fitting session with our master tailor at Surajpole, Udaipur.
                </p>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-12 px-6 rounded-2xl bg-gold/10 border border-gold/40 space-y-4">
                  <CheckCircle2 size={48} className="text-gold mx-auto" />
                  <h4 className="font-serif text-2xl text-cream">Appointment Request Received!</h4>
                  <p className="text-cream/70 font-body text-sm max-w-md mx-auto">
                    Our showroom concierge has registered your fitting in our system and will contact you shortly to confirm your slot.
                  </p>
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="px-6 py-2.5 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold"
                  >
                    Book Another Session
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Vikramaditya Singh"
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
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                        value={formData.occasion}
                        onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream text-sm font-body focus:outline-none focus:border-gold transition-colors"
                      >
                        <option value="wedding">Royal Wedding (Baraat / Pheras)</option>
                        <option value="sangeet">Sangeet & Cocktail</option>
                        <option value="reception">Grand Reception</option>
                        <option value="engagement">Engagement / Ring Ceremony</option>
                        <option value="festival">Royal Festival / Family Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                        Service Needed
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream text-sm font-body focus:outline-none focus:border-gold transition-colors"
                      >
                        <option value="Royal Outfit Rental">Royal Outfit Rental</option>
                        <option value="Bespoke Tailoring">Bespoke Tailoring & Trial</option>
                        <option value="Custom Rajputi Outfit">Custom Rajputi Couture</option>
                        <option value="Baraat Group Styling">Baraat Group Coordination</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream text-sm font-body focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-cream/80 mb-2">
                      Specific Requirements or Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share details such as color preference, number of family members, or ceremony timing..."
                      className="w-full px-4 py-3 rounded-xl bg-night border border-gold/25 text-cream placeholder-cream/30 text-sm font-body focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-gold via-copper to-gold text-night font-serif text-xs uppercase tracking-widest font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Reserving Appointment in System...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Confirm Appointment Reservation</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
