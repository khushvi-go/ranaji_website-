import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Initialize Lenis smooth scrolling
  useLenis();

  useEffect(() => {
    // Check if user has already visited
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
      {/* Logo Preloader */}
      {isLoading && <LogoPreloader onLoadingComplete={handleLoadingComplete} />}

      {/* Main Content */}
      {showContent && (
        <>
          {/* Scroll Progress Bar */}
          <ScrollProgress />

          {/* Navigation */}
          <Navbar />

          {/* Main Content */}
          <main>
            {/* Hero Section */}
            <HeroSection />

            {/* Marquee Strip */}
            <MarqueeStrip />

            {/* About / Legacy Section */}
            <LegacySection />

            {/* Collections Section */}
            <CollectionsSection />

            {/* Services / Experience Section */}
            <ExperienceSection />

            {/* Cultural / Udaipur Section */}
            <UdaipurSection />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* Gallery Section */}
            <GallerySection />

            {/* Contact Section */}
            <ContactSection />
          </main>

          {/* Footer */}
          <Footer />

          {/* Toast Notifications */}
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
}

export default App;
