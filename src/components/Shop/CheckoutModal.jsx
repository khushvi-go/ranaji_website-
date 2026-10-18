import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Crown, Sparkles, CheckCircle2, ShieldCheck, 
  MapPin, Phone, Mail, User, CreditCard, MessageCircle, 
  Truck, ArrowRight, Printer, ShoppingBag 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';

const CheckoutModal = () => {
  const { cart, total, subtotal, securityDeposit, isCheckoutOpen, closeCheckout, clearCart } = useCart();
  const { user, isAuthenticated, createOrder } = useUser();

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    deliveryType: 'showroom', // 'showroom' or 'delivery'
    street: user?.address?.street || '',
    city: user?.address?.city || 'Udaipur',
    pincode: user?.address?.pincode || '313001',
    paymentMethod: 'whatsapp', // 'whatsapp', 'cod', 'upi'
    fittingNotes: user?.measurements?.notes || '',
  });

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please enter your name and phone number');
      return;
    }
    setStep(2);
  };

  const handleFinalOrder = async () => {
    setIsSubmitting(true);
    const orderNumber = `RNJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // If user is logged in, record the order
      if (isAuthenticated && createOrder) {
        try {
          await createOrder({
            items: cart.map((c) => ({
              product: c.product.name,
              type: c.orderType,
              size: c.selectedSize,
              price: c.unitPrice,
              quantity: c.quantity
            })),
            total,
            notes: `Delivery: ${formData.deliveryType} | Method: ${formData.paymentMethod} | Notes: ${formData.fittingNotes}`
          });
        } catch (err) {
          console.warn('Could not persist order to backend account, saving locally', err);
        }
      }

      // Store in local storage for order history & tracking
      const newOrder = {
        orderId: orderNumber,
        items: cart.map((c) => ({
          product: c.product.name,
          image: c.product.image,
          type: c.orderType,
          size: c.selectedSize,
          price: c.unitPrice,
          quantity: c.quantity,
          rentalDays: c.rentalDays,
          rentalStartDate: c.rentalStartDate
        })),
        total,
        securityDeposit,
        status: formData.deliveryType === 'showroom' ? 'Fitting Scheduled at Udaipur Showroom' : 'Order Placed (Processing)',
        createdAt: new Date().toISOString(),
        deliveryType: formData.deliveryType,
        customerName: formData.name,
        customerPhone: formData.phone
      };

      try {
        const existing = JSON.parse(localStorage.getItem('ranaji_user_orders') || '[]');
        localStorage.setItem('ranaji_user_orders', JSON.stringify([newOrder, ...existing]));
      } catch (e) {
        console.error('Failed to store local order', e);
      }

      setConfirmedOrderId(orderNumber);
      setStep(3);
      clearCart();
      toast.success('Royal Order Confirmed!', {
        icon: '👑',
        style: {
          background: '#1C1208',
          color: '#DEA044',
          border: '1px solid #DEA044',
        }
      });

      // If user selected WhatsApp payment, open WhatsApp after 1 second
      if (formData.paymentMethod === 'whatsapp') {
        const orderSummary = cart
          .map((item) => `• ${item.product.name} (${item.orderType === 'rent' ? `Rental ${item.rentalDays}d` : 'Purchase'}) - Size ${item.selectedSize} x ${item.quantity} = ₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}`)
          .join('\n');

        const message = encodeURIComponent(
          `*👑 RANAJI ROYAL SHOWROOM ORDER - #${orderNumber}*\n\n*Customer Details:*\n- Name: ${formData.name}\n- Phone: ${formData.phone}\n- Delivery: ${formData.deliveryType === 'showroom' ? 'Store Trial & Pickup (Surajpole, Udaipur)' : `${formData.street}, ${formData.city} - ${formData.pincode}`}\n\n*Order Items:*\n${orderSummary}\n\n*Security Deposit:* ₹${securityDeposit.toLocaleString('en-IN')}\n*Grand Total:* ₹${total.toLocaleString('en-IN')}\n*Fitting Notes:* ${formData.fittingNotes || 'Standard'}\n\nPlease confirm availability and booking.`
        );

        setTimeout(() => {
          window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
        }, 800);
      }
    } catch (error) {
      toast.error('Failed to complete order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCheckout}
          className="fixed inset-0 bg-night/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-night-light border border-gold/30 rounded-2xl shadow-2xl overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-night">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Crown size={22} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-cream font-medium">Royal Checkout</h3>
                <p className="text-xs text-cream/50 font-body">
                  Step {step} of 3: {step === 1 ? 'Customer Details' : step === 2 ? 'Payment Method' : 'Order Placed'}
                </p>
              </div>
            </div>

            {step !== 3 && (
              <button
                onClick={closeCheckout}
                className="text-cream/50 hover:text-gold transition-colors p-2"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* STEP 1: Customer Details */}
          {step === 1 && (
            <form onSubmit={handleNextToPayment} className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cream/80 text-xs font-body uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-gold/60" />
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Kunwar Vikram Singh"
                      className="w-full pl-10 pr-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-cream/80 text-xs font-body uppercase tracking-wider mb-2">
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-gold/60" />
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-cream/80 text-xs font-body uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-gold/60" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="royalclient@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Type */}
              <div className="space-y-2">
                <label className="block text-cream/80 text-xs font-body uppercase tracking-wider">
                  Pickup / Delivery Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData((p) => ({ ...p, deliveryType: 'showroom' }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.deliveryType === 'showroom'
                        ? 'border-gold bg-gold/10'
                        : 'border-gold/20 bg-night hover:border-gold/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-gold font-medium text-sm">
                      <MapPin size={16} />
                      Udaipur Showroom Trial & Pickup
                    </div>
                    <p className="text-cream/50 text-xs mt-1">
                      Surajpole Showroom, Udaipur. Free in-person royal trial & fitting adjustments.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData((p) => ({ ...p, deliveryType: 'delivery' }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.deliveryType === 'delivery'
                        ? 'border-gold bg-gold/10'
                        : 'border-gold/20 bg-night hover:border-gold/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-gold font-medium text-sm">
                      <Truck size={16} />
                      Doorstep Delivery
                    </div>
                    <p className="text-cream/50 text-xs mt-1">
                      Direct insured courier to your residence in Udaipur or across India.
                    </p>
                  </div>
                </div>
              </div>

              {/* Address details if delivery selected */}
              {formData.deliveryType === 'delivery' && (
                <div className="space-y-3 p-4 bg-night rounded-xl border border-gold/20">
                  <label className="block text-cream/80 text-xs font-body uppercase tracking-wider">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="House/Villa No, Street, Landmark"
                    className="w-full px-3 py-2 bg-night-light border border-gold/20 rounded-lg text-cream text-xs focus:border-gold focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City (e.g. Udaipur)"
                      className="px-3 py-2 bg-night-light border border-gold/20 rounded-lg text-cream text-xs focus:border-gold focus:outline-none"
                    />
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Pincode (e.g. 313001)"
                      className="px-3 py-2 bg-night-light border border-gold/20 rounded-lg text-cream text-xs focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Fitting Notes */}
              <div>
                <label className="block text-cream/80 text-xs font-body uppercase tracking-wider mb-1">
                  Tailoring & Sizing Instructions (Optional)
                </label>
                <textarea
                  name="fittingNotes"
                  rows={2}
                  value={formData.fittingNotes}
                  onChange={handleChange}
                  placeholder="e.g., Groom height 5'11, chest 40, event date November 14th, needs matching red dupatta..."
                  className="w-full px-3 py-2 bg-night border border-gold/20 rounded-xl text-cream text-xs focus:border-gold focus:outline-none resize-none"
                />
              </div>

              {/* Footer action */}
              <div className="pt-4 border-t border-gold/20 flex items-center justify-between">
                <div>
                  <span className="text-cream/50 text-xs block">Order Total:</span>
                  <span className="font-serif text-gold text-2xl font-bold">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 bg-gold hover:bg-copper text-night font-body text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  Continue to Payment
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-cream/80 text-xs font-body uppercase tracking-wider">
                  Select Preferred Payment / Confirmation Mode
                </label>

                {/* Option 1: WhatsApp Royal Concierge */}
                <div
                  onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'whatsapp' }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    formData.paymentMethod === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : 'border-gold/20 bg-night hover:border-gold/40'
                  }`}
                >
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <MessageCircle size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-cream font-medium">
                        Instant WhatsApp Showroom Concierge (Recommended)
                      </span>
                      <span className="text-emerald-400 text-xs font-body">Direct Booking</span>
                    </div>
                    <p className="text-cream/60 text-xs font-body mt-1">
                      Sends your complete ensemble selection directly to our Ranaji Udaipur boutique master. We will confirm rental dates, sizing trial, and payment directly on WhatsApp.
                    </p>
                  </div>
                </div>

                {/* Option 2: Pay on Delivery / Trial */}
                <div
                  onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'cod' }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    formData.paymentMethod === 'cod'
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/20 bg-night hover:border-gold/40'
                  }`}
                >
                  <div className="p-2.5 rounded-lg bg-gold/20 text-gold shrink-0">
                    <Truck size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-cream font-medium">
                        Pay on Pickup / Cash on Delivery
                      </span>
                      <span className="text-gold text-xs font-body">Pay Later</span>
                    </div>
                    <p className="text-cream/60 text-xs font-body mt-1">
                      Pay after inspecting and trying on the garments at our Udaipur showroom or at your doorstep.
                    </p>
                  </div>
                </div>

                {/* Option 3: UPI / Digital Mock */}
                <div
                  onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'upi' }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    formData.paymentMethod === 'upi'
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/20 bg-night hover:border-gold/40'
                  }`}
                >
                  <div className="p-2.5 rounded-lg bg-gold/20 text-gold shrink-0">
                    <CreditCard size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-cream font-medium">
                        UPI / QR / Net Banking
                      </span>
                      <span className="text-gold text-xs font-body">Instant</span>
                    </div>
                    <p className="text-cream/60 text-xs font-body mt-1">
                      Pay via Google Pay, PhonePe, Paytm, or Credit/Debit card with simulated instant confirmation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Breakdown Box */}
              <div className="p-4 rounded-xl bg-night border border-gold/20 space-y-2 text-xs font-body">
                <div className="flex justify-between text-cream/70">
                  <span>Ensembles & Accessories ({cart.length} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {securityDeposit > 0 && (
                  <div className="flex justify-between text-blue-300">
                    <span>Refundable Rental Deposit</span>
                    <span>₹{securityDeposit.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-400">
                  <span>Fitting & Doorstep Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="pt-2 border-t border-gold/20 flex justify-between items-baseline font-serif">
                  <span className="text-cream text-sm">Grand Total Amount</span>
                  <span className="text-gold text-2xl font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gold/20 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-gold/30 text-cream/70 hover:text-gold rounded-xl text-xs uppercase tracking-wider"
                >
                  Back to Details
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalOrder}
                  className="px-8 py-3 bg-gold hover:bg-copper text-night font-body text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  {isSubmitting ? (
                    'Processing Order...'
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Confirm & Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Confirmation */}
          {step === 3 && (
            <div className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 mx-auto rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center text-gold"
              >
                <Crown size={40} />
              </motion.div>

              <div>
                <h3 className="font-serif text-3xl text-gold font-bold">
                  Khammaghani & Congratulations!
                </h3>
                <p className="text-cream text-base font-serif mt-1">
                  Your royal booking has been placed successfully.
                </p>
                <div className="inline-block mt-3 px-4 py-1.5 bg-night border border-gold/30 rounded-full font-mono text-xs text-gold">
                  Order ID: {confirmedOrderId}
                </div>
              </div>

              <div className="p-4 bg-night rounded-xl border border-gold/20 max-w-md mx-auto text-left text-xs font-body space-y-2 text-cream/80">
                <div className="flex justify-between">
                  <span className="text-cream/50">Client Name:</span>
                  <span className="font-medium text-cream">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream/50">Contact:</span>
                  <span className="font-medium text-cream">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream/50">Fulfillment:</span>
                  <span className="font-medium text-cream">
                    {formData.deliveryType === 'showroom' ? 'Store Trial & Pickup (Surajpole, Udaipur)' : 'Doorstep Delivery'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream/50">Payment Choice:</span>
                  <span className="font-medium text-gold uppercase">{formData.paymentMethod}</span>
                </div>
              </div>

              <p className="text-xs text-cream/60 max-w-sm mx-auto">
                Our royal concierge team will contact you on WhatsApp (+91 {formData.phone}) to confirm fitting schedules and collection dates.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 border border-gold/40 text-gold hover:bg-gold/10 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Printer size={16} />
                  Print Receipt
                </button>

                <button
                  onClick={closeCheckout}
                  className="px-8 py-2.5 bg-gold hover:bg-copper text-night rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  Return to Showroom
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
