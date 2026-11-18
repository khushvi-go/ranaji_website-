import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Receipt, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Mail,
  MessageCircle,
  FileText,
  Percent,
  Sliders,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';
import { settingsAPI } from '../../services/api';

const Settings = () => {
  const { isOwner, role } = useAdmin();
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [formData, setFormData] = useState({
    showroomName: '',
    tagline: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    customerServiceEmail: '',
    address: '',
    openingHours: '',
    googleMapsUrl: '',
    gstNumber: '',
    stateCode: '',
    invoicePrefix: '',
    invoiceNotes: '',
    instagramUrl: '',
    facebookUrl: '',
    maxCashierDiscountPercent: 10,
    maxCashierDiscountAmount: 2000,
    maxInventoryWriteOffQty: 2,
    requireApprovalForRefunds: true,
    requireApprovalForWriteOffs: true
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.get();
      const s = res.data || res;
      setFormData({
        showroomName: s.showroomName || 'Ranaji Udaipur',
        tagline: s.tagline || 'Royal Rajasthani Wedding Wardrobe & Tailoring',
        phone: s.phone || '+91 98765 43210',
        whatsappNumber: s.whatsappNumber || '919876543210',
        email: s.email || 'contact@ranaji.com',
        customerServiceEmail: s.customerServiceEmail || 'contact@ranaji.com',
        address: s.address || '24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001',
        openingHours: s.openingHours || 'Mon – Sun: 10:00 AM – 9:00 PM',
        googleMapsUrl: s.googleMapsUrl || 'https://maps.google.com/?q=Surajpole+Udaipur',
        gstNumber: s.gstNumber || '08AAAAA0000A1Z5',
        stateCode: s.stateCode || '08',
        invoicePrefix: s.invoicePrefix || 'RNJ',
        invoiceNotes: s.invoiceNotes || 'All royal ensembles are handcrafted in Udaipur. Retain this invoice for trial fittings and authorized exchanges.',
        instagramUrl: s.instagramUrl || 'https://www.instagram.com/ranaji_udaipur',
        facebookUrl: s.facebookUrl || 'https://www.facebook.com/share/18PhEG4c3J/',
        maxCashierDiscountPercent: s.maxCashierDiscountPercent != null ? s.maxCashierDiscountPercent : 10,
        maxCashierDiscountAmount: s.maxCashierDiscountAmount != null ? s.maxCashierDiscountAmount : 2000,
        maxInventoryWriteOffQty: s.maxInventoryWriteOffQty != null ? s.maxInventoryWriteOffQty : 2,
        requireApprovalForRefunds: s.requireApprovalForRefunds !== false,
        requireApprovalForWriteOffs: s.requireApprovalForWriteOffs !== false
      });
      if (s.updatedAt) setLastSaved(new Date(s.updatedAt));
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Unable to fetch showroom settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isOwner) {
      toast.error('Only the Showroom Owner has authority to modify business settings and policies.');
      return;
    }

    setSaving(true);
    try {
      const res = await settingsAPI.update(formData);
      if (res.success || res.data) {
        toast.success('Showroom settings & tax policies updated in MongoDB Atlas!', { icon: '👑' });
        setLastSaved(new Date());
      } else {
        toast.error(res.message || 'Failed to save settings.');
      }
    } catch (err) {
      console.error('Update settings error:', err);
      toast.error('Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'identity', label: 'Showroom Identity', icon: Building2 },
    { id: 'contact', label: 'Contact & Communication', icon: Phone },
    { id: 'location', label: 'Store Location & Hours', icon: MapPin },
    { id: 'invoice', label: 'GST & Invoice Config', icon: Receipt },
    { id: 'safeguards', label: 'Operational Policies', icon: ShieldCheck }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-cream/60 font-body text-sm">Loading showroom business configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-2xl sm:text-3xl text-cream font-medium">Showroom Settings & Policies</h1>
            <span className="px-3 py-1 rounded-full text-xs font-body font-semibold bg-gold/15 text-gold border border-gold/30">
              OWNER CONTROLLED
            </span>
          </div>
          <p className="text-cream/60 font-body text-xs sm:text-sm">
            Centralized business profile, tax invoice parameters, public contact information, and showroom safeguards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="p-2.5 rounded-xl border border-gold/30 text-gold hover:bg-gold/10 transition-colors flex items-center gap-2 text-xs font-body"
            title="Reload settings"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isOwner}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold via-copper to-gold text-night font-body text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {lastSaved && (
        <div className="text-right text-[11px] text-cream/40 font-mono -mt-4">
          Last updated: {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ({lastSaved.toLocaleDateString('en-IN')})
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gold/10 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-body transition-all ${
                isActive
                  ? 'bg-gold text-night font-bold shadow-md'
                  : 'bg-cream/5 border border-gold/15 text-cream/70 hover:text-cream hover:bg-cream/10'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: IDENTITY */}
        {activeTab === 'identity' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/20 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-gold/10 pb-4">
              <Building2 className="text-gold" size={20} />
              <div>
                <h3 className="font-serif text-lg text-cream font-medium">Showroom Identity</h3>
                <p className="text-xs text-cream/50 font-body">Official registered brand and branding tagline displayed on website & bills</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Showroom Name *
                </label>
                <input
                  type="text"
                  value={formData.showroomName}
                  onChange={(e) => handleChange('showroomName', e.target.value)}
                  className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-serif"
                  placeholder="Ranaji Udaipur"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-body"
                  placeholder="Royal Rajasthani Wedding Wardrobe & Tailoring"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Instagram Showcase URL
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-mono text-xs"
                  placeholder="https://www.instagram.com/ranaji_udaipur"
                />
              </div>

              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-mono text-xs"
                  placeholder="https://www.facebook.com/share/..."
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CONTACT */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/20 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-gold/10 pb-4">
              <Phone className="text-gold" size={20} />
              <div>
                <h3 className="font-serif text-lg text-cream font-medium">Communication Channels</h3>
                <p className="text-xs text-cream/50 font-body">Used in website header, footer, appointment WhatsApp links, and invoice headers</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Primary Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-body"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  WhatsApp Concierge Number (Digits with Country Code) *
                </label>
                <div className="relative">
                  <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-mono"
                    placeholder="919876543210"
                    required
                  />
                </div>
                <p className="text-[11px] text-cream/40 mt-1 font-body">
                  Format: 919876543210 (starts with 91 for India, no spaces or plus sign)
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Primary Business Email *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-body"
                    placeholder="contact@ranaji.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Customer Service Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" />
                  <input
                    type="email"
                    value={formData.customerServiceEmail}
                    onChange={(e) => handleChange('customerServiceEmail', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-body"
                    placeholder="info@ranajiudaipur.com"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: LOCATION */}
        {activeTab === 'location' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/20 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-gold/10 pb-4">
              <MapPin className="text-gold" size={20} />
              <div>
                <h3 className="font-serif text-lg text-cream font-medium">Physical Location & Timings</h3>
                <p className="text-xs text-cream/50 font-body">Showroom address in Udaipur, Google Maps link, and client trial operating hours</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                Full Showroom Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-body resize-none"
                placeholder="24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Showroom Opening Hours *
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" />
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => handleChange('openingHours', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-body"
                    placeholder="Mon – Sun: 10:00 AM – 9:00 PM"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Google Maps Location URL
                </label>
                <div className="relative">
                  <ExternalLink size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" />
                  <input
                    type="url"
                    value={formData.googleMapsUrl}
                    onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-mono text-xs"
                    placeholder="https://maps.google.com/?q=Surajpole+Udaipur"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: INVOICE & GST */}
        {activeTab === 'invoice' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/20 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-gold/10 pb-4">
              <Receipt className="text-gold" size={20} />
              <div>
                <h3 className="font-serif text-lg text-cream font-medium">GST & Showroom Tax Invoices</h3>
                <p className="text-xs text-cream/50 font-body">Official registration credentials printed on counter GST invoices and online receipts</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  GSTIN (15 Digits) *
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-mono tracking-wider"
                  placeholder="08AAAAA0000A1Z5"
                  maxLength={15}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  State Code (Rajasthan = 08)
                </label>
                <input
                  type="text"
                  value={formData.stateCode}
                  onChange={(e) => handleChange('stateCode', e.target.value)}
                  className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-mono text-center"
                  placeholder="08"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                  Invoice Number Prefix
                </label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-mono text-center"
                  placeholder="RNJ"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-body text-cream/70 mb-2 uppercase tracking-wider font-semibold">
                Invoice Terms & Jurisdiction Notice
              </label>
              <textarea
                value={formData.invoiceNotes}
                onChange={(e) => handleChange('invoiceNotes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-xl font-body resize-none"
                placeholder="All royal ensembles are handcrafted in Udaipur. Retain this invoice for trial fittings and authorized exchanges."
              />
            </div>
          </motion.div>
        )}

        {/* TAB 5: OPERATIONAL POLICIES */}
        {activeTab === 'safeguards' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/20 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-gold/10 pb-4">
              <ShieldCheck className="text-gold" size={20} />
              <div>
                <h3 className="font-serif text-lg text-cream font-medium">Operational Safeguards & RBAC Thresholds</h3>
                <p className="text-xs text-cream/50 font-body">Internal policy limits configured by the showroom owner to enforce dual-custody</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 bg-night/80 border border-gold/15 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <Percent size={18} />
                  <h4 className="font-serif text-sm font-semibold text-cream">Cashier Discount Limit</h4>
                </div>
                <div>
                  <label className="block text-xs text-cream/60 font-body mb-1">Max Cashier Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.maxCashierDiscountPercent}
                    onChange={(e) => handleChange('maxCashierDiscountPercent', Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-lg font-mono"
                  />
                  <p className="text-[11px] text-cream/40 mt-1">Discounts above this percent trigger an approval request code.</p>
                </div>
                <div>
                  <label className="block text-xs text-cream/60 font-body mb-1">Max Cashier Discount Flat Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxCashierDiscountAmount}
                    onChange={(e) => handleChange('maxCashierDiscountAmount', Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="p-5 bg-night/80 border border-gold/15 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <Sliders size={18} />
                  <h4 className="font-serif text-sm font-semibold text-cream">Inventory Write-Off Threshold</h4>
                </div>
                <div>
                  <label className="block text-xs text-cream/60 font-body mb-1">Max Unapproved Quantity Write-Off (Units)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxInventoryWriteOffQty}
                    onChange={(e) => handleChange('maxInventoryWriteOffQty', Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-night border border-gold/20 focus:border-gold outline-none text-cream text-sm rounded-lg font-mono"
                  />
                  <p className="text-[11px] text-cream/40 mt-1">Stock adjustments higher than this threshold require Manager or Owner authorization.</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-4 bg-night/60 border border-gold/15 rounded-xl cursor-pointer hover:border-gold/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.requireApprovalForRefunds}
                  onChange={(e) => handleChange('requireApprovalForRefunds', e.target.checked)}
                  className="w-4 h-4 accent-gold rounded"
                />
                <div>
                  <span className="text-sm font-medium text-cream block">Require Approval for Cashier Refunds</span>
                  <span className="text-xs text-cream/50">Mandates a manager/owner authorization code before a cashier can issue refunds.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-night/60 border border-gold/15 rounded-xl cursor-pointer hover:border-gold/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.requireApprovalForWriteOffs}
                  onChange={(e) => handleChange('requireApprovalForWriteOffs', e.target.checked)}
                  className="w-4 h-4 accent-gold rounded"
                />
                <div>
                  <span className="text-sm font-medium text-cream block">Enforce Dual-Custody on Stock Write-Offs</span>
                  <span className="text-xs text-cream/50">Prevents individual stock adjustments without an approved justification request.</span>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gold/15">
          <p className="text-xs text-cream/40 font-body">
            {isOwner ? '✓ You have full Owner privileges to modify all settings & policies.' : '🔒 You are in read-only mode. Only the Showroom Owner may commit policy changes.'}
          </p>

          <button
            type="submit"
            disabled={saving || !isOwner}
            className="px-8 py-3 rounded-xl bg-gold text-night font-body text-xs font-bold uppercase tracking-wider hover:bg-copper transition-all shadow-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
