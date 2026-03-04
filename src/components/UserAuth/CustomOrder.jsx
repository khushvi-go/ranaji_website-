import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Ruler, Upload, Check, Package, 
  Shirt, Sparkles, Palette, Scissors, Crown
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';

const clothingTypes = [
  { id: 'sherwani', name: 'Sherwani', icon: Crown, description: 'Traditional royal attire for grooms' },
  { id: 'kurta', name: 'Kurta Set', icon: Shirt, description: 'Elegant kurta with pajama/churidar' },
  { id: 'suit', name: 'Indo-Western Suit', icon: Sparkles, description: 'Fusion of Indian and Western styles' },
  { id: 'lehenga', name: 'Lehenga', icon: Palette, description: 'Bridal and festive lehengas' },
  { id: 'saree', name: 'Designer Saree', icon: Scissors, description: 'Custom designed sarees' },
  { id: 'other', name: 'Other Custom', icon: Package, description: 'Tell us your requirements' }
];

const fabricOptions = [
  'Silk', 'Velvet', 'Brocade', 'Cotton Silk', 'Georgette', 
  'Chiffon', 'Banarasi', 'Linen', 'Wool', 'Other'
];

const colorOptions = [
  'Royal Blue', 'Deep Red', 'Emerald Green', 'Gold', 'Silver',
  'Ivory/White', 'Black', 'Maroon', 'Purple', 'Peach', 'Other'
];

const budgetRanges = [
  '₹5,000 - ₹10,000',
  '₹10,000 - ₹25,000',
  '₹25,000 - ₹50,000',
  '₹50,000 - ₹1,00,000',
  'Above ₹1,00,000'
];

const CustomOrder = () => {
  const { user, isAuthenticated, createOrder } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [orderData, setOrderData] = useState({
    clothingType: '',
    fabric: '',
    color: '',
    budget: '',
    occasion: '',
    deliveryDate: '',
    specialInstructions: '',
    useSavedMeasurements: true,
    referenceImages: []
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to place a custom order');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field, value) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setOrderData(prev => ({ ...prev, referenceImages: files }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const items = [{
        type: orderData.clothingType,
        fabric: orderData.fabric,
        color: orderData.color,
        occasion: orderData.occasion,
        specialInstructions: orderData.specialInstructions
      }];

      const result = await createOrder({
        items,
        total: 0, // Will be calculated by admin
        notes: `Budget: ${orderData.budget}\nDelivery Date: ${orderData.deliveryDate}\nUse Saved Measurements: ${orderData.useSavedMeasurements ? 'Yes' : 'No'}`
      });

      if (result.success) {
        toast.success('Custom order submitted successfully!');
        navigate('/profile');
      } else {
        toast.error(result.message || 'Failed to submit order');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !orderData.clothingType) {
      toast.error('Please select a clothing type');
      return;
    }
    if (step === 2 && (!orderData.fabric || !orderData.color)) {
      toast.error('Please select fabric and color');
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/10 to-copper/10 border-b border-gold/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/profile"
              className="flex items-center gap-2 text-cream/70 hover:text-gold font-body transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Profile
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-gold font-display text-lg">RANAJI</span>
              <span className="text-cream/50 font-body">| Custom Order</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-body font-semibold ${
                step >= s 
                  ? 'bg-gold text-night' 
                  : 'bg-cream/10 text-cream/50'
              }`}>
                {step > s ? <Check size={18} /> : s}
              </div>
              {s < 4 && (
                <div className={`w-20 h-1 mx-2 ${
                  step > s ? 'bg-gold' : 'bg-cream/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-cream/5 border border-gold/20 rounded-2xl p-8"
        >
          {/* Step 1: Clothing Type */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-2">What would you like to order?</h2>
              <p className="text-cream/50 font-body mb-8">Select the type of clothing you want to customize</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clothingTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleChange('clothingType', type.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      orderData.clothingType === type.id
                        ? 'border-gold bg-gold/10'
                        : 'border-gold/20 hover:border-gold/40 bg-cream/5'
                    }`}
                  >
                    <type.icon className={`mb-4 ${
                      orderData.clothingType === type.id ? 'text-gold' : 'text-cream/50'
                    }`} size={28} />
                    <h3 className="font-display text-lg text-cream mb-1">{type.name}</h3>
                    <p className="text-cream/50 font-body text-sm">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Fabric & Color */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-2">Fabric & Color Preferences</h2>
              <p className="text-cream/50 font-body mb-8">Choose your preferred materials</p>
              
              <div className="space-y-8">
                {/* Fabric */}
                <div>
                  <label className="block text-cream font-body mb-4">Select Fabric</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {fabricOptions.map((fabric) => (
                      <button
                        key={fabric}
                        onClick={() => handleChange('fabric', fabric)}
                        className={`px-4 py-3 rounded-lg border font-body text-sm transition-all ${
                          orderData.fabric === fabric
                            ? 'border-gold bg-gold/20 text-gold'
                            : 'border-gold/20 text-cream/70 hover:border-gold/40'
                        }`}
                      >
                        {fabric}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-cream font-body mb-4">Preferred Color</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleChange('color', color)}
                        className={`px-4 py-3 rounded-lg border font-body text-sm transition-all ${
                          orderData.color === color
                            ? 'border-gold bg-gold/20 text-gold'
                            : 'border-gold/20 text-cream/70 hover:border-gold/40'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Details */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-2">Budget & Occasion</h2>
              <p className="text-cream/50 font-body mb-8">Help us understand your requirements better</p>
              
              <div className="space-y-6">
                {/* Budget */}
                <div>
                  <label className="block text-cream font-body mb-4">Your Budget Range</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {budgetRanges.map((budget) => (
                      <button
                        key={budget}
                        onClick={() => handleChange('budget', budget)}
                        className={`px-4 py-3 rounded-lg border font-body text-sm transition-all text-left ${
                          orderData.budget === budget
                            ? 'border-gold bg-gold/20 text-gold'
                            : 'border-gold/20 text-cream/70 hover:border-gold/40'
                        }`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-cream font-body mb-2">Occasion</label>
                  <input
                    type="text"
                    value={orderData.occasion}
                    onChange={(e) => handleChange('occasion', e.target.value)}
                    placeholder="e.g., Wedding, Engagement, Festival..."
                    className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-cream font-body mb-2">Preferred Delivery Date</label>
                  <input
                    type="date"
                    value={orderData.deliveryDate}
                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-2">Review Your Order</h2>
              <p className="text-cream/50 font-body mb-8">Please verify all details before submitting</p>
              
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-cream/5 border border-gold/20 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-cream/50 font-body">Clothing Type</span>
                    <span className="text-cream font-body capitalize">{orderData.clothingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream/50 font-body">Fabric</span>
                    <span className="text-cream font-body">{orderData.fabric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream/50 font-body">Color</span>
                    <span className="text-cream font-body">{orderData.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream/50 font-body">Budget</span>
                    <span className="text-cream font-body">{orderData.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream/50 font-body">Occasion</span>
                    <span className="text-cream font-body">{orderData.occasion || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream/50 font-body">Delivery Date</span>
                    <span className="text-cream font-body">{orderData.deliveryDate || 'Not specified'}</span>
                  </div>
                </div>

                {/* Measurements */}
                <div className="bg-cream/5 border border-gold/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Ruler className="text-gold" size={20} />
                      <span className="text-cream font-body">Measurements</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderData.useSavedMeasurements}
                        onChange={(e) => handleChange('useSavedMeasurements', e.target.checked)}
                        className="w-4 h-4 accent-gold"
                      />
                      <span className="text-cream/70 font-body text-sm">Use my saved measurements</span>
                    </label>
                  </div>
                  
                  {orderData.useSavedMeasurements ? (
                    <p className="text-cream/50 font-body text-sm">
                      We'll use the measurements from your profile. You can update them in your profile page.
                    </p>
                  ) : (
                    <p className="text-cream/50 font-body text-sm">
                      Our team will contact you for measurements after order confirmation.
                    </p>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-cream font-body mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={orderData.specialInstructions}
                    onChange={(e) => handleChange('specialInstructions', e.target.value)}
                    rows={3}
                    placeholder="Any specific design elements, embroidery preferences, or other requirements..."
                    className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Reference Images */}
                <div>
                  <label className="block text-cream font-body mb-2">Reference Images (Optional)</label>
                  <div className="border-2 border-dashed border-gold/20 rounded-lg p-6 text-center">
                    <Upload className="text-gold/50 mx-auto mb-2" size={32} />
                    <p className="text-cream/50 font-body text-sm mb-2">
                      Upload up to 3 reference images
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-4 py-2 bg-gold/20 text-gold rounded-lg font-body text-sm cursor-pointer hover:bg-gold/30 transition-colors"
                    >
                      Choose Files
                    </label>
                    {orderData.referenceImages.length > 0 && (
                      <p className="text-cream/70 font-body text-sm mt-2">
                        {orderData.referenceImages.length} image(s) selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gold/20">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gold/30 text-cream font-body rounded-lg hover:bg-gold/10 transition-colors"
              >
                Previous
              </button>
            ) : (
              <div />
            )}
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-gold to-copper text-night font-body font-semibold rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-gold to-copper text-night font-body font-semibold rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-night/30 border-t-night rounded-full"
                  />
                ) : (
                  <>
                    <Check size={18} />
                    Submit Order
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomOrder;
