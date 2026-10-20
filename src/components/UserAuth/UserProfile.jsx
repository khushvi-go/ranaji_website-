import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, MapPin, Ruler, ShoppingBag, MessageSquare, 
  LogOut, Edit2, Save, Crown, ChevronRight, Package,
  Heart, Camera, Phone, Mail, Calendar, Home,
  Star, CheckCircle, Clock, XCircle, Quote
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { ordersAPI, testimonialsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, logout, updateProfile, isAuthenticated, loading } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dbOrders, setDbOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [userTestimonials, setUserTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: '',
    profile: { gender: '', dateOfBirth: '' },
    address: { street: '', city: '', state: '', pincode: '', landmark: '' },
    measurements: {
      chest: '', shoulder: '', sleeveLength: '', armHole: '',
      frontNeck: '', backNeck: '', waist: '', hips: '',
      inseam: '', thigh: '', knee: '', ankle: '', outseam: '',
      height: '', weight: '', notes: ''
    },
    sizePreferences: { shirtSize: '', pantSize: '', kurtaSize: '', sherwaniSize: '', lehengaSize: '' }
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        profile: { ...profileData.profile, ...user.profile },
        address: { ...profileData.address, ...user.address },
        measurements: { ...profileData.measurements, ...user.measurements },
        sizePreferences: { ...profileData.sizePreferences, ...user.sizePreferences }
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const queryParams = new URLSearchParams();
        if (user._id || user.id) queryParams.append('user', user._id || user.id);
        if (user.email) queryParams.append('email', user.email);
        if (user.phone) queryParams.append('phone', user.phone);
        const res = await ordersAPI.getAll(`?${queryParams.toString()}`);
        if (res && res.data && res.data.length > 0) {
          setDbOrders(res.data);
        } else if (Array.isArray(user.orders) && user.orders.length > 0) {
          setDbOrders(user.orders);
        } else {
          setDbOrders([]);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
        if (Array.isArray(user.orders)) {
          setDbOrders(user.orders);
        }
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === 'orders' || user) {
      fetchUserOrders();
    }
  }, [user, activeTab]);

  useEffect(() => {
    const fetchUserTestimonials = async () => {
      if (!user) return;
      setLoadingTestimonials(true);
      try {
        const userId = user._id || user.id;
        const res = await testimonialsAPI.getAll(`?user=${userId}`);
        if (res && res.data) {
          setUserTestimonials(res.data);
        } else if (Array.isArray(res)) {
          setUserTestimonials(res);
        } else {
          setUserTestimonials([]);
        }
      } catch (err) {
        console.error('Failed to load user testimonials:', err);
      } finally {
        setLoadingTestimonials(false);
      }
    };

    if (activeTab === 'testimonials' || user) {
      fetchUserTestimonials();
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        profile: profileData.profile,
        address: profileData.address,
        measurements: profileData.measurements,
        sizePreferences: profileData.sizePreferences
      });
      
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    if (section) {
      setProfileData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'measurements', label: 'Measurements', icon: Ruler },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'testimonials', label: 'My Testimonials', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/10 to-copper/10 border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center border-2 border-gold/40">
                <User className="text-gold" size={32} />
              </div>
              <div>
                <h1 className="font-display text-2xl text-cream">{user.name}</h1>
                <p className="text-cream/50 font-body text-sm">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-4 py-2 text-cream/70 hover:text-gold font-body text-sm transition-colors"
              >
                Back to Home
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-crimson/20 hover:bg-crimson/30 text-crimson rounded-lg font-body text-sm transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-cream/5 border border-gold/20 rounded-xl overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 font-body text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-gold/20 text-gold border-l-2 border-gold'
                      : 'text-cream/70 hover:bg-cream/5 hover:text-cream'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  <ChevronRight size={16} className="ml-auto opacity-50" />
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-cream/5 border border-gold/20 rounded-xl p-6">
              <h3 className="font-display text-lg text-cream mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/custom-order"
                  className="flex items-center gap-3 text-cream/70 hover:text-gold font-body text-sm transition-colors"
                >
                  <Package size={16} />
                  Custom Order
                </Link>
                <Link
                  to="/testimonials/write"
                  className="flex items-center gap-3 text-cream/70 hover:text-gold font-body text-sm transition-colors"
                >
                  <MessageSquare size={16} />
                  Write Testimonial
                </Link>
                <Link
                  to="/collections"
                  className="flex items-center gap-3 text-cream/70 hover:text-gold font-body text-sm transition-colors"
                >
                  <Heart size={16} />
                  Browse Collections
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-cream/5 border border-gold/20 rounded-xl p-6">
              {/* Edit Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-cream">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                {activeTab !== 'orders' && activeTab !== 'testimonials' && (
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg font-body text-sm transition-colors"
                  >
                    {saving ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full"
                      />
                    ) : isEditing ? (
                      <><Save size={16} /> Save</>
                    ) : (
                      <><Edit2 size={16} /> Edit</>
                    )}
                  </button>
                )}
                {activeTab === 'testimonials' && (
                  <Link
                    to="/testimonials/write"
                    className="flex items-center gap-2 px-4 py-2 bg-gold text-night rounded-lg font-body text-xs font-semibold hover:bg-gold/90 transition-colors shadow-sm"
                  >
                    <MessageSquare size={14} />
                    Write New Review
                  </Link>
                )}
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-cream/50 text-sm font-body mb-2">Full Name</label>
                      <div className="flex items-center gap-3 bg-cream/5 border border-gold/10 rounded-lg px-4 py-3">
                        <User size={18} className="text-gold/50" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => handleChange(null, 'name', e.target.value)}
                            className="bg-transparent text-cream font-body w-full focus:outline-none"
                          />
                        ) : (
                          <span className="text-cream font-body">{profileData.name || 'Not set'}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-cream/50 text-sm font-body mb-2">Email</label>
                      <div className="flex items-center gap-3 bg-cream/5 border border-gold/10 rounded-lg px-4 py-3">
                        <Mail size={18} className="text-gold/50" />
                        <span className="text-cream font-body">{profileData.email}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-cream/50 text-sm font-body mb-2">Phone</label>
                      <div className="flex items-center gap-3 bg-cream/5 border border-gold/10 rounded-lg px-4 py-3">
                        <Phone size={18} className="text-gold/50" />
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => handleChange(null, 'phone', e.target.value)}
                            className="bg-transparent text-cream font-body w-full focus:outline-none"
                          />
                        ) : (
                          <span className="text-cream font-body">{profileData.phone || 'Not set'}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-cream/50 text-sm font-body mb-2">Gender</label>
                      <div className="flex items-center gap-3 bg-cream/5 border border-gold/10 rounded-lg px-4 py-3">
                        <User size={18} className="text-gold/50" />
                        {isEditing ? (
                          <select
                            value={profileData.profile.gender}
                            onChange={(e) => handleChange('profile', 'gender', e.target.value)}
                            className="bg-transparent text-cream font-body w-full focus:outline-none"
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <span className="text-cream font-body capitalize">{profileData.profile.gender || 'Not set'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size Preferences */}
                  <div className="mt-8">
                    <h3 className="font-display text-lg text-cream mb-4">Size Preferences</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { key: 'shirtSize', label: 'Shirt' },
                        { key: 'pantSize', label: 'Pant' },
                        { key: 'kurtaSize', label: 'Kurta' },
                        { key: 'sherwaniSize', label: 'Sherwani' },
                        { key: 'lehengaSize', label: 'Lehenga' }
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-cream/50 text-xs font-body mb-1">{label}</label>
                          {isEditing ? (
                            <select
                              value={profileData.sizePreferences[key]}
                              onChange={(e) => handleChange('sizePreferences', key, e.target.value)}
                              className="w-full bg-cream/5 border border-gold/20 rounded-lg px-3 py-2 text-cream font-body text-sm focus:outline-none focus:border-gold"
                            >
                              <option value="">-</option>
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                              <option value="XXXL">XXXL</option>
                            </select>
                          ) : (
                            <div className="bg-cream/5 border border-gold/10 rounded-lg px-3 py-2 text-cream font-body text-sm text-center">
                              {profileData.sizePreferences[key] || '-'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-cream/50 text-sm font-body mb-2">Street Address</label>
                      {isEditing ? (
                        <textarea
                          value={profileData.address.street}
                          onChange={(e) => handleChange('address', 'street', e.target.value)}
                          rows={2}
                          className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                        />
                      ) : (
                        <div className="bg-cream/5 border border-gold/10 rounded-lg px-4 py-3 text-cream font-body">
                          {profileData.address.street || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-cream/50 text-sm font-body mb-2">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address.city}
                          onChange={(e) => handleChange('address', 'city', e.target.value)}
                          className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                        />
                      ) : (
                        <div className="bg-cream/5 border border-gold/10 rounded-lg px-4 py-3 text-cream font-body">
                          {profileData.address.city || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-cream/50 text-sm font-body mb-2">State</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address.state}
                          onChange={(e) => handleChange('address', 'state', e.target.value)}
                          className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                        />
                      ) : (
                        <div className="bg-cream/5 border border-gold/10 rounded-lg px-4 py-3 text-cream font-body">
                          {profileData.address.state || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-cream/50 text-sm font-body mb-2">PIN Code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address.pincode}
                          onChange={(e) => handleChange('address', 'pincode', e.target.value)}
                          className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                        />
                      ) : (
                        <div className="bg-cream/5 border border-gold/10 rounded-lg px-4 py-3 text-cream font-body">
                          {profileData.address.pincode || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-cream/50 text-sm font-body mb-2">Landmark</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address.landmark}
                          onChange={(e) => handleChange('address', 'landmark', e.target.value)}
                          className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body focus:outline-none focus:border-gold"
                        />
                      ) : (
                        <div className="bg-cream/5 border border-gold/10 rounded-lg px-4 py-3 text-cream font-body">
                          {profileData.address.landmark || 'Not set'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Measurements Tab */}
              {activeTab === 'measurements' && (
                <div className="space-y-6">
                  <p className="text-cream/50 font-body text-sm">
                    Save your measurements for custom clothing orders. All measurements should be in inches.
                  </p>
                  
                  {/* Upper Body */}
                  <div>
                    <h3 className="font-display text-lg text-cream mb-4">Upper Body</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { key: 'chest', label: 'Chest' },
                        { key: 'shoulder', label: 'Shoulder' },
                        { key: 'sleeveLength', label: 'Sleeve Length' },
                        { key: 'armHole', label: 'Arm Hole' },
                        { key: 'frontNeck', label: 'Front Neck' },
                        { key: 'backNeck', label: 'Back Neck' }
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-cream/50 text-xs font-body mb-1">{label} (in)</label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={profileData.measurements[key]}
                              onChange={(e) => handleChange('measurements', key, e.target.value)}
                              className="w-full bg-cream/5 border border-gold/20 rounded-lg px-3 py-2 text-cream font-body text-sm focus:outline-none focus:border-gold"
                            />
                          ) : (
                            <div className="bg-cream/5 border border-gold/10 rounded-lg px-3 py-2 text-cream font-body text-sm">
                              {profileData.measurements[key] ? `${profileData.measurements[key]}"` : '-'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lower Body */}
                  <div>
                    <h3 className="font-display text-lg text-cream mb-4">Lower Body</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'waist', label: 'Waist' },
                        { key: 'hips', label: 'Hips' },
                        { key: 'inseam', label: 'Inseam' },
                        { key: 'thigh', label: 'Thigh' },
                        { key: 'knee', label: 'Knee' },
                        { key: 'ankle', label: 'Ankle' },
                        { key: 'outseam', label: 'Outseam' }
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-cream/50 text-xs font-body mb-1">{label} (in)</label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={profileData.measurements[key]}
                              onChange={(e) => handleChange('measurements', key, e.target.value)}
                              className="w-full bg-cream/5 border border-gold/20 rounded-lg px-3 py-2 text-cream font-body text-sm focus:outline-none focus:border-gold"
                            />
                          ) : (
                            <div className="bg-cream/5 border border-gold/10 rounded-lg px-3 py-2 text-cream font-body text-sm">
                              {profileData.measurements[key] ? `${profileData.measurements[key]}"` : '-'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full Body */}
                  <div>
                    <h3 className="font-display text-lg text-cream mb-4">Full Body</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-cream/50 text-xs font-body mb-1">Height (cm)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={profileData.measurements.height}
                            onChange={(e) => handleChange('measurements', 'height', e.target.value)}
                            className="w-full bg-cream/5 border border-gold/20 rounded-lg px-3 py-2 text-cream font-body text-sm focus:outline-none focus:border-gold"
                          />
                        ) : (
                          <div className="bg-cream/5 border border-gold/10 rounded-lg px-3 py-2 text-cream font-body text-sm">
                            {profileData.measurements.height ? `${profileData.measurements.height} cm` : '-'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-cream/50 text-xs font-body mb-1">Weight (kg)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={profileData.measurements.weight}
                            onChange={(e) => handleChange('measurements', 'weight', e.target.value)}
                            className="w-full bg-cream/5 border border-gold/20 rounded-lg px-3 py-2 text-cream font-body text-sm focus:outline-none focus:border-gold"
                          />
                        ) : (
                          <div className="bg-cream/5 border border-gold/10 rounded-lg px-3 py-2 text-cream font-body text-sm">
                            {profileData.measurements.weight ? `${profileData.measurements.weight} kg` : '-'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-cream/50 text-sm font-body mb-2">Additional Notes</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.measurements.notes}
                        onChange={(e) => handleChange('measurements', 'notes', e.target.value)}
                        rows={3}
                        placeholder="Any special requirements or notes for tailoring..."
                        className="w-full bg-cream/5 border border-gold/20 rounded-lg px-4 py-3 text-cream font-body text-sm focus:outline-none focus:border-gold"
                      />
                    ) : (
                      <div className="bg-cream/5 border border-gold/10 rounded-lg px-4 py-3 text-cream font-body text-sm min-h-[80px]">
                        {profileData.measurements.notes || 'No notes added'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {loadingOrders ? (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-cream/60 font-body text-sm">Loading your royal orders...</p>
                    </div>
                  ) : dbOrders.length > 0 ? (
                    <div className="space-y-4">
                      {dbOrders.map((order, idx) => (
                        <div key={order.id || order._id || order.orderNumber || order.orderId || idx} className="bg-cream/5 border border-gold/20 rounded-xl p-5 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/15 pb-3">
                            <div>
                              <span className="font-mono text-gold text-sm font-bold block">{order.orderNumber || order.orderId}</span>
                              <span className="text-[11px] text-cream/50">
                                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                              </span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-body font-medium bg-gold/15 text-gold border border-gold/30">
                              {order.orderStatus || order.status || 'Fitting Scheduled'}
                            </span>
                          </div>

                          {/* Items list */}
                          <div className="space-y-2">
                            {(order.items || []).map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-3 text-xs">
                                {item.image && (
                                  <div className="w-10 h-12 rounded overflow-hidden border border-gold/20 shrink-0 bg-night">
                                    <img src={item.image} alt={item.productName || item.product} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="font-serif text-cream font-medium truncate block">
                                    {item.productName || item.product || item.type || 'Custom Royal Garment'}
                                  </span>
                                  <span className="text-cream/50 text-[11px]">
                                    {(item.orderType === 'rent' || item.type === 'rent') ? `Rental (${item.rentalDays || 3} Days)` : 'Purchase'} • Size: {item.size || 'Custom'}
                                  </span>
                                </div>
                                <span className="text-gold font-serif font-bold">
                                  ₹{Number(item.unitPrice || item.price || order.total)?.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gold/10 text-xs">
                            <span className="text-cream/60">
                              {order.deliveryType === 'showroom' ? 'Pickup & Trial at Surajpole, Udaipur' : 'Doorstep Insured Delivery'}
                            </span>
                            <div className="text-right">
                              <span className="text-cream/40 text-[11px] block">Grand Total</span>
                              <span className="font-serif text-gold text-base font-bold">
                                ₹{Number(order.total)?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <Package size={48} className="text-gold/40 mx-auto" />
                      <div>
                        <p className="text-cream font-serif text-lg">No Royal Orders Yet</p>
                        <p className="text-cream/50 text-xs max-w-sm mx-auto mt-1">
                          Browse our wedding sherwanis and bridal poshaks for rent or purchase.
                        </p>
                      </div>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-night font-body text-xs font-semibold hover:bg-gold/90 transition-colors"
                      >
                        Explore Royal Collection
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Testimonials Tab */}
              {activeTab === 'testimonials' && (
                <div>
                  {loadingTestimonials ? (
                    <div className="flex items-center justify-center py-16">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full"
                      />
                    </div>
                  ) : userTestimonials && userTestimonials.length > 0 ? (
                    <div className="space-y-4">
                      {userTestimonials.map((item, idx) => {
                        const status = item.status || (item.isActive ? 'approved' : 'pending');
                        return (
                          <div
                            key={item.id || item._id || idx}
                            className="bg-cream/5 border border-gold/20 rounded-xl p-5 space-y-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/10 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={16}
                                      className={`${
                                        star <= (item.rating || 5)
                                          ? 'text-gold fill-gold'
                                          : 'text-cream/20'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-cream/60 font-body text-xs ml-1">
                                  {item.occasion || 'Wedding Ensemble'}
                                </span>
                              </div>

                              <div>
                                {status === 'approved' ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle size={12} /> Approved & Live
                                  </span>
                                ) : status === 'rejected' ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                    <XCircle size={12} /> Declined
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium bg-gold/15 text-gold border border-gold/30">
                                    <Clock size={12} /> Under Review by Royal Admin
                                  </span>
                                )}
                              </div>
                            </div>

                            <blockquote className="font-serif text-cream/90 text-sm italic leading-relaxed">
                              &ldquo;{item.text || item.content}&rdquo;
                            </blockquote>

                            <div className="flex items-center justify-between text-xs text-cream/50 pt-1">
                              <span>Location: {item.location || 'Udaipur, Rajasthan'}</span>
                              <span>
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'Recently submitted'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <Quote size={44} className="text-gold/40 mx-auto" />
                      <div>
                        <p className="text-cream font-serif text-lg">No Royal Reviews Yet</p>
                        <p className="text-cream/50 text-xs max-w-sm mx-auto mt-1">
                          Share your experience with Ranaji craftsmanship and help other patrons discover our royal attire.
                        </p>
                      </div>
                      <Link
                        to="/testimonials/write"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-night font-body text-xs font-semibold hover:bg-gold/90 transition-colors"
                      >
                        <MessageSquare size={14} />
                        Share Your Experience
                      </Link>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
