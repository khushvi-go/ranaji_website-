import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LogoPreloader from './components/Preloader/LogoPreloader';
import ScrollToTop from './components/UI/ScrollToTop';
import ScrollProgress from './components/UI/ScrollProgress';
import useLenis from './hooks/useLenis';

// Public Multi-Page Components
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CollectionsPage from './pages/CollectionsPage';
import ServicesPage from './pages/ServicesPage';
import LegacyPage from './pages/LegacyPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// User & Customer Auth
import AuthSuccess from './components/UserAuth/AuthSuccess';
import UserLogin from './components/UserAuth/UserLogin';
import UserRegister from './components/UserAuth/UserRegister';
import UserProfile from './components/UserAuth/UserProfile';
import CustomOrder from './components/UserAuth/CustomOrder';
import UserTestimonial from './components/UserAuth/UserTestimonial';

// Shop & Cart Providers and Overlays
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { BusinessProvider } from './context/BusinessContext';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';
import ProductDetailsModal from './components/Shop/ProductDetailsModal';
import CartDrawer from './components/Shop/CartDrawer';
import CheckoutModal from './components/Shop/CheckoutModal';

// Admin imports
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLayout from './admin/components/AdminLayout';
import Login from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import POS from './admin/pages/POS';
import SalesInvoices from './admin/pages/SalesInvoices';
import Inventory from './admin/pages/Inventory';
import Customers from './admin/pages/Customers';
import Collections from './admin/pages/Collections';
import Categories from './admin/pages/Categories';
import Testimonials from './admin/pages/Testimonials';
import Gallery from './admin/pages/Gallery';
import Services from './admin/pages/Services';
import Bookings from './admin/pages/Bookings';
import Contacts from './admin/pages/Contacts';
import Staff from './admin/pages/Staff';
import Settings from './admin/pages/Settings';
import Approvals from './admin/pages/Approvals';
import AuditLogs from './admin/pages/AuditLogs';
import Rentals from './admin/pages/Rentals';
import Orders from './admin/pages/Orders';
import Reports from './admin/pages/Reports';

// Protected Route Component with Role Enforcement
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, adminUser, loading } = useAdmin();
  if (loading) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const currentRole = role || (adminUser?.role === 'admin' ? 'owner' : (adminUser?.role || 'owner'));
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    if (currentRole === 'cashier') return <Navigate to="/admin/pos" replace />;
    if (currentRole === 'inventory') return <Navigate to="/admin/inventory" replace />;
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Home Wrapper to present royal preloader on initial visit
const HomeWrapper = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('ranaji-visited');
    if (hasVisited) {
      setIsLoading(false);
      setShowContent(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowContent(true);
  };

  return (
    <>
      {isLoading && <LogoPreloader onLoadingComplete={handleLoadingComplete} />}
      {showContent && <HomePage />}
    </>
  );
};

// Main App Container initializing smooth scroll hook
const AppContainer = () => {
  useLenis();

  return (
    <Router>
      <ScrollToTop />
      <ScrollProgress />
      <Routes>
        {/* Public Multi-Page Showroom Routes */}
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/legacy" element={<LegacyPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Customer Account Routes */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/account" element={<Navigate to="/profile" replace />} />
        <Route path="/custom-order" element={<CustomOrder />} />
        <Route path="/testimonials" element={<UserTestimonial />} />
        <Route path="/testimonials/write" element={<UserTestimonial />} />
        
        {/* Staff Shortcut Route */}
        <Route path="/staff" element={<Navigate to="/admin/pos" replace />} />

        {/* Admin & Showroom Operational Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <BusinessProvider>
                <AdminLayout />
              </BusinessProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager', 'cashier']}><POS /></ProtectedRoute>} />
          <Route path="sales" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager', 'cashier']}><SalesInvoices /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><Orders /></ProtectedRoute>} />
          <Route path="inventory" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager', 'inventory']}><Inventory /></ProtectedRoute>} />
          <Route path="customers" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager', 'cashier']}><Customers /></ProtectedRoute>} />
          <Route path="rentals" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager', 'cashier']}><Rentals /></ProtectedRoute>} />
          <Route path="collections" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager', 'inventory']}><Collections /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager', 'inventory']}><Categories /></ProtectedRoute>} />
          <Route path="testimonials" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><Testimonials /></ProtectedRoute>} />
          <Route path="gallery" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><Gallery /></ProtectedRoute>} />
          <Route path="services" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><Services /></ProtectedRoute>} />
          <Route path="bookings" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><Bookings /></ProtectedRoute>} />
          <Route path="contacts" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><Contacts /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><Reports /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Staff /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Settings /></ProtectedRoute>} />
          <Route path="approvals" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager', 'cashier', 'inventory']}><Approvals /></ProtectedRoute>} />
          <Route path="audit-logs" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><AuditLogs /></ProtectedRoute>} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Global E-Commerce Modals & Overlays */}
      <ProductDetailsModal />
      <CartDrawer />
      <CheckoutModal />

      {/* Global Royal Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1C1208',
            color: '#F5EFE0',
            border: '1px solid #DEA044',
          },
          success: {
            iconTheme: {
              primary: '#DEA044',
              secondary: '#1C1208',
            },
          },
        }}
      />
    </Router>
  );
};

function App() {
  return (
    <AdminProvider>
      <UserProvider>
        <ShopProvider>
          <SettingsProvider>
            <CartProvider>
              <AppContainer />
            </CartProvider>
          </SettingsProvider>
        </ShopProvider>
      </UserProvider>
    </AdminProvider>
  );
}

export default App;
