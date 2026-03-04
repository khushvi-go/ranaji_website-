import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LogoPreloader from './components/Preloader/LogoPreloader';
import Navbar from './components/Navigation/Navbar';
import useLenis from './hooks/useLenis';
import HeroSection from './components/Hero/HeroSection';
import MarqueeStrip from './components/UI/MarqueeStrip';
import LegacySection from './components/About/LegacySection';
import CollectionsSection from './components/Collections/CollectionsSection';
import ExperienceSection from './components/Services/ExperienceSection';
import UdaipurSection from './components/Cultural/UdaipurSection';
import TestimonialsSection from './components/Testimonials/TestimonialsSection';
import GallerySection from './components/Gallery/GallerySection';
import ContactSection from './components/Contact/ContactSection';
import Footer from './components/Footer/Footer';
import ScrollProgress from './components/UI/ScrollProgress';

// Admin imports
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLayout from './admin/components/AdminLayout';
import Login from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import Collections from './admin/pages/Collections';
import Testimonials from './admin/pages/Testimonials';
import Gallery from './admin/pages/Gallery';
import Services from './admin/pages/Services';
import Bookings from './admin/pages/Bookings';
import Contacts from './admin/pages/Contacts';

// User imports
import { UserProvider } from './context/UserContext';
import UserLogin from './components/UserAuth/UserLogin';
import UserRegister from './components/UserAuth/UserRegister';
import UserProfile from './components/UserAuth/UserProfile';
import CustomOrder from './components/UserAuth/CustomOrder';
import UserTestimonial from './components/UserAuth/UserTestimonial';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAdmin();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

// Main Website Component
const MainWebsite = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useLenis();

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
    <div className="relative bg-night min-h-screen">
      {isLoading && <LogoPreloader onLoadingComplete={handleLoadingComplete} />}
      {showContent && (
        <>
          <ScrollProgress />
          <Navbar />
          <main>
            <HeroSection />
            <MarqueeStrip />
            <LegacySection />
            <CollectionsSection />
            <ExperienceSection />
            <UdaipurSection />
            <TestimonialsSection />
            <GallerySection />
            <ContactSection />
          </main>
          <Footer />
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
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <AdminProvider>
      <UserProvider>
        <Router>
          <Routes>
            {/* Main Website */}
            <Route path="/" element={<MainWebsite />} />
            
            {/* User Auth Routes */}
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/custom-order" element={<CustomOrder />} />
            <Route path="/testimonials/write" element={<UserTestimonial />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="collections" element={<Collections />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="services" element={<Services />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="contacts" element={<Contacts />} />
            </Route>
          </Routes>
        </Router>
      </UserProvider>
    </AdminProvider>
  );
}

export default App;
