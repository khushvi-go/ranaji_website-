import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  MessageSquare, 
  Image, 
  Briefcase,
  Calendar,
  Mail,
  TrendingUp,
  Users,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, link }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="relative group"
  >
    <Link to={link} className="block">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/20 to-copper/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-cream/5 border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-colors duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={24} className="text-cream" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-body ${trendUp ? 'text-green-400' : 'text-crimson'}`}>
              <TrendingUp size={16} className={trendUp ? '' : 'rotate-180'} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-display text-cream mb-1">{value}</h3>
        <p className="text-cream/50 font-body text-sm">{label}</p>
      </div>
    </Link>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, description, link, color }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: 4 }}
    className="group"
  >
    <Link to={link} className="flex items-center gap-4 p-4 bg-cream/5 border border-gold/10 rounded-xl hover:border-gold/30 hover:bg-cream/[0.07] transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-cream" />
      </div>
      <div className="flex-1">
        <h4 className="font-body font-medium text-cream group-hover:text-gold transition-colors">{label}</h4>
        <p className="text-cream/40 text-sm font-body">{description}</p>
      </div>
      <ArrowRight size={18} className="text-cream/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
    </Link>
  </motion.div>
);

const RecentActivity = ({ title, items, emptyMessage }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-cream/5 border border-gold/10 rounded-xl p-6"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-serif text-xl text-cream">{title}</h3>
      <span className="text-cream/40 text-sm font-body">{items.length} items</span>
    </div>
    
    {items.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-cream/40 font-body text-sm">{emptyMessage}</p>
      </div>
    ) : (
      <div className="space-y-4">
        {items.slice(0, 5).map((item, index) => (
          <div key={item.id || index} className="flex items-center gap-4 p-3 bg-night rounded-lg border border-gold/5">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-gold font-display text-sm">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cream font-body text-sm truncate">{item.name || item.title || 'Untitled'}</p>
              <p className="text-cream/40 text-xs font-body">
                {new Date(item.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </motion.div>
);

const Dashboard = () => {
  const { stats, bookings, contacts, collections, testimonials, gallery } = useAdmin();

  const statCards = [
    { 
      icon: ShoppingBag, 
      label: 'Collections', 
      value: stats.totalCollections, 
      color: 'bg-gold/20',
      link: '/admin/collections'
    },
    { 
      icon: MessageSquare, 
      label: 'Testimonials', 
      value: stats.totalTestimonials, 
      color: 'bg-copper/20',
      link: '/admin/testimonials'
    },
    { 
      icon: Image, 
      label: 'Gallery Images', 
      value: stats.totalGallery, 
      color: 'bg-lake/20',
      link: '/admin/gallery'
    },
    { 
      icon: Briefcase, 
      label: 'Services', 
      value: stats.totalServices, 
      color: 'bg-crimson/20',
      link: '/admin/services'
    },
    { 
      icon: Calendar, 
      label: 'Bookings', 
      value: stats.totalBookings,
      trend: stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : null,
      trendUp: true,
      color: 'bg-green-500/20',
      link: '/admin/bookings'
    },
    { 
      icon: Mail, 
      label: 'Messages', 
      value: stats.totalContacts,
      trend: stats.unreadContacts > 0 ? `${stats.unreadContacts} unread` : null,
      trendUp: true,
      color: 'bg-purple-500/20',
      link: '/admin/contacts'
    },
  ];

  const quickActions = [
    {
      icon: ShoppingBag,
      label: 'Add New Collection',
      description: 'Add a new product to your catalog',
      link: '/admin/collections',
      color: 'bg-gold/20'
    },
    {
      icon: Image,
      label: 'Upload Gallery Image',
      description: 'Add new photos to the gallery',
      link: '/admin/gallery',
      color: 'bg-lake/20'
    },
    {
      icon: MessageSquare,
      label: 'Add Testimonial',
      description: 'Add a new customer review',
      link: '/admin/testimonials',
      color: 'bg-copper/20'
    },
    {
      icon: Eye,
      label: 'View Website',
      description: 'Preview your website',
      link: '/',
      color: 'bg-green-500/20'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Dashboard</h1>
          <p className="text-cream/50 font-body">Welcome back to your admin panel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg">
            <span className="text-gold font-body text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/10 rounded-xl p-6"
          >
            <h3 className="font-serif text-xl text-cream mb-6">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <QuickAction key={action.label} {...action} />
              ))}
            </div>
          </motion.div>

          {/* Recent Bookings */}
          <RecentActivity 
            title="Recent Bookings" 
            items={bookings} 
            emptyMessage="No bookings yet"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Messages */}
          <RecentActivity 
            title="Recent Messages" 
            items={contacts} 
            emptyMessage="No messages yet"
          />

          {/* Website Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gold/10 to-copper/10 border border-gold/20 rounded-xl p-6"
          >
            <h3 className="font-serif text-xl text-cream mb-4">Website Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-cream/60 font-body text-sm">Total Products</span>
                <span className="text-cream font-body font-medium">{stats.totalCollections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream/60 font-body text-sm">Gallery Images</span>
                <span className="text-cream font-body font-medium">{stats.totalGallery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream/60 font-body text-sm">Testimonials</span>
                <span className="text-cream font-body font-medium">{stats.totalTestimonials}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream/60 font-body text-sm">Services</span>
                <span className="text-cream font-body font-medium">{stats.totalServices}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gold/10">
              <div className="flex items-center justify-between">
                <span className="text-cream/60 font-body text-sm">Pending Bookings</span>
                <span className={`font-body font-medium ${stats.pendingBookings > 0 ? 'text-gold' : 'text-cream'}`}>
                  {stats.pendingBookings}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-cream/60 font-body text-sm">Unread Messages</span>
                <span className={`font-body font-medium ${stats.unreadContacts > 0 ? 'text-gold' : 'text-cream'}`}>
                  {stats.unreadContacts}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
