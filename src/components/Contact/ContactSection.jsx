import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import GoldButton from '../UI/GoldButton';

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
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
    
    // WhatsApp API URL with your number
    const whatsappUrl = `https://wa.me/919876543210?text=${message}`;
    
    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    reset();
    setTimeout(() => setSubmitSuccess(false), 3000);
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
          title="Book Your Royal Appointment"
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-body text-cream/70 text-sm mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors"
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="text-crimson text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block font-body text-cream/70 text-sm mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    type="tel"
                    className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="text-crimson text-sm mt-1">{errors.phone.message}</p>
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
                    className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream [&>option]:bg-night [&>option]:text-cream"
                  >
                    <option value="" className="bg-night text-cream">Select occasion</option>
                    <option value="wedding" className="bg-night text-cream">Wedding</option>
                    <option value="engagement" className="bg-night text-cream">Engagement</option>
                    <option value="baarat" className="bg-night text-cream">Baarat</option>
                    <option value="other" className="bg-night text-cream">Other</option>
                  </select>
                  {errors.occasion && (
                    <p className="text-crimson text-sm mt-1">{errors.occasion.message}</p>
                  )}
                </div>
                <div>
                  <label className="block font-body text-cream/70 text-sm mb-2">
                    Looking For *
                  </label>
                  <select
                    {...register('lookingFor', { required: 'This field is required' })}
                    className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors text-cream [&>option]:bg-night [&>option]:text-cream"
                  >
                    <option value="" className="bg-night text-cream">Select option</option>
                    <option value="purchase" className="bg-night text-cream">Purchase</option>
                    <option value="rental" className="bg-night text-cream">Rental</option>
                    <option value="both" className="bg-night text-cream">Both</option>
                  </select>
                  {errors.lookingFor && (
                    <p className="text-crimson text-sm mt-1">{errors.lookingFor.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-body text-cream/70 text-sm mb-2">
                  Preferred Date
                </label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-body text-cream/70 text-sm mb-2">
                  Message
                </label>
                <textarea
                  {...register('message')}
                  rows={4}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 focus:border-gold outline-none transition-colors resize-none"
                  placeholder="Tell us about your requirements..."
                />
              </div>

              <GoldButton
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    'Opening WhatsApp...'
                  ) : submitSuccess ? (
                    'WhatsApp Opened!'
                  ) : (
                    <>
                      Send via WhatsApp
                      <MessageCircle size={18} />
                    </>
                  )}
                </span>
              </GoldButton>
            </form>
          </motion.div>

          {/* Right - Store Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Info Cards */}
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 p-6 bg-cream/5 border border-gold/10"
              >
                <div className="w-12 h-12 bg-gold/10 flex items-center justify-center shrink-0">
                  <info.icon className="text-gold" size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-cream mb-1">{info.title}</h3>
                  {info.href ? (
                    <a 
                      href={info.href}
                      className="font-body text-cream/60 hover:text-gold transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="font-body text-cream/60">{info.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Map */}
            <motion.a
              href="https://maps.app.goo.gl/X6WTs63sTx9NGqje9"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-video bg-cream/5 border border-gold/10 overflow-hidden block group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-night/50 group-hover:bg-night/30 transition-colors">
                <div className="text-center">
                  <MapPin size={48} className="text-gold mx-auto mb-2" />
                  <p className="text-cream font-body">Click to View on Google Maps</p>
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

            {/* WhatsApp CTA */}
            <motion.a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white font-body font-medium tracking-wider hover:bg-[#128C7E] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle size={24} />
              Chat on WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
