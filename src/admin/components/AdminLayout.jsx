import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Image, 
  Briefcase,
  Calendar,
  Mail,
  LogOut,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, adminUser, stats } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/collections', icon: ShoppingBag, label: 'Collections' },
    { path: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials' },
    { path: '/admin/gallery', icon: Image, label: 'Gallery' },
    { path: '/admin/services', icon: Briefcase, label: 'Services' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings', badge: stats.pendingBookings },
    { path: '/admin/contacts', icon: Mail, label: 'Messages', badge: stats.unreadContacts },
  ];

  return (
    <div className="min-h-screen bg-night flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-night border-r border-gold/20 z-40 transition-all duration-300 ${
          isSidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
              <Crown className="text-gold" size={24} />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-display text-xl text-cream tracking-wider">RANAJI</h1>
                  <p className="text-xs text-cream/50 font-body">Admin Panel</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'text-cream/70 hover:bg-cream/5 hover:text-cream'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-body text-sm whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge > 0 && (
                <span className={`absolute ${isSidebarOpen ? 'right-3' : 'right-2'} bg-crimson text-cream text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gold/20">
          <AnimatePresence>
            {isSidebarOpen && adminUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 px-2"
              >
                <p className="text-cream/50 text-xs font-body mb-1">Logged in as</p>
                <p className="text-cream font-body text-sm">{adminUser.username}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-cream/70 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-all duration-300"
          >
            <LogOut size={20} className="shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-body text-sm whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gold text-night rounded-full flex items-center justify-center shadow-lg hover:bg-copper transition-colors"
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xs">‹</span>
          </motion.div>
        </button>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-night border-b border-gold/20 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
            <Crown className="text-gold" size={18} />
          </div>
          <span className="font-display text-lg text-cream tracking-wider">RANAJI</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gold p-2"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-16 left-0 right-0 bg-night border-b border-gold/20 z-40 p-4"
          >
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-cream/70 hover:bg-cream/5 hover:text-cream'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span className="font-body text-sm">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-crimson text-cream text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-cream/70 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-all duration-300"
              >
                <LogOut size={20} />
                <span className="font-body text-sm">Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <div className="lg:p-8 p-4 pt-20 lg:pt-8 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
