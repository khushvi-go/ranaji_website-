import { createContext, useContext, useState, useEffect } from 'react';
import { collections as initialCollections } from '../data/collections';
import { testimonials as initialTestimonials } from '../data/testimonials';
import { galleryImages as initialGallery } from '../data/gallery';
import { services as initialServices } from '../data/services';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  
  // Data states
  const [collections, setCollections] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Load data on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('ranaji-admin-auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(authData.isAuthenticated);
      setAdminUser(authData.adminUser);
    }

    // Initialize data from localStorage or use initial data
    const storedCollections = localStorage.getItem('ranaji-collections');
    const storedTestimonials = localStorage.getItem('ranaji-testimonials');
    const storedGallery = localStorage.getItem('ranaji-gallery');
    const storedServices = localStorage.getItem('ranaji-services');
    const storedBookings = localStorage.getItem('ranaji-bookings');
    const storedContacts = localStorage.getItem('ranaji-contacts');

    setCollections(storedCollections ? JSON.parse(storedCollections) : initialCollections);
    setTestimonials(storedTestimonials ? JSON.parse(storedTestimonials) : initialTestimonials);
    setGallery(storedGallery ? JSON.parse(storedGallery) : initialGallery);
    setServices(storedServices ? JSON.parse(storedServices) : initialServices);
    if (storedBookings) setBookings(JSON.parse(storedBookings));
    if (storedContacts) setContacts(JSON.parse(storedContacts));
  }, []);

  // Auth functions
  const login = (username, password) => {
    if (username === 'admin' && password === 'ranaji123') {
      const user = { username, role: 'admin', loginTime: new Date().toISOString() };
      setIsAuthenticated(true);
      setAdminUser(user);
      localStorage.setItem('ranaji-admin-auth', JSON.stringify({ isAuthenticated: true, adminUser: user }));
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('ranaji-admin-auth');
  };

  // Collections
  const addCollection = (collection) => {
    const newCollection = { ...collection, id: Date.now() };
    const updated = [...collections, newCollection];
    setCollections(updated);
    localStorage.setItem('ranaji-collections', JSON.stringify(updated));
  };

  const updateCollection = (id, updatedData) => {
    const updated = collections.map(c => c.id === id ? { ...c, ...updatedData } : c);
    setCollections(updated);
    localStorage.setItem('ranaji-collections', JSON.stringify(updated));
  };

  const deleteCollection = (id) => {
    const updated = collections.filter(c => c.id !== id);
    setCollections(updated);
    localStorage.setItem('ranaji-collections', JSON.stringify(updated));
  };

  // Testimonials
  const addTestimonial = (testimonial) => {
    const newTestimonial = { ...testimonial, id: Date.now() };
    const updated = [...testimonials, newTestimonial];
    setTestimonials(updated);
    localStorage.setItem('ranaji-testimonials', JSON.stringify(updated));
  };

  const updateTestimonial = (id, updatedData) => {
    const updated = testimonials.map(t => t.id === id ? { ...t, ...updatedData } : t);
    setTestimonials(updated);
    localStorage.setItem('ranaji-testimonials', JSON.stringify(updated));
  };

  const deleteTestimonial = (id) => {
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    localStorage.setItem('ranaji-testimonials', JSON.stringify(updated));
  };

  // Gallery
  const addGalleryImage = (image) => {
    const newImage = { ...image, id: Date.now() };
    const updated = [...gallery, newImage];
    setGallery(updated);
    localStorage.setItem('ranaji-gallery', JSON.stringify(updated));
  };

  const updateGalleryImage = (id, updatedData) => {
    const updated = gallery.map(g => g.id === id ? { ...g, ...updatedData } : g);
    setGallery(updated);
    localStorage.setItem('ranaji-gallery', JSON.stringify(updated));
  };

  const deleteGalleryImage = (id) => {
    const updated = gallery.filter(g => g.id !== id);
    setGallery(updated);
    localStorage.setItem('ranaji-gallery', JSON.stringify(updated));
  };

  // Services
  const addService = (service) => {
    const newService = { ...service, id: Date.now() };
    const updated = [...services, newService];
    setServices(updated);
    localStorage.setItem('ranaji-services', JSON.stringify(updated));
  };

  const updateService = (id, updatedData) => {
    const updated = services.map(s => s.id === id ? { ...s, ...updatedData } : s);
    setServices(updated);
    localStorage.setItem('ranaji-services', JSON.stringify(updated));
  };

  const deleteService = (id) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    localStorage.setItem('ranaji-services', JSON.stringify(updated));
  };

  // Bookings
  const addBooking = (booking) => {
    const newBooking = { ...booking, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() };
    const updated = [...bookings, newBooking];
    setBookings(updated);
    localStorage.setItem('ranaji-bookings', JSON.stringify(updated));
  };

  const updateBookingStatus = (id, status) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(updated);
    localStorage.setItem('ranaji-bookings', JSON.stringify(updated));
  };

  const deleteBooking = (id) => {
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    localStorage.setItem('ranaji-bookings', JSON.stringify(updated));
  };

  // Contacts
  const addContact = (contact) => {
    const newContact = { ...contact, id: Date.now(), createdAt: new Date().toISOString(), read: false };
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem('ranaji-contacts', JSON.stringify(updated));
  };

  const markContactAsRead = (id) => {
    const updated = contacts.map(c => c.id === id ? { ...c, read: true } : c);
    setContacts(updated);
    localStorage.setItem('ranaji-contacts', JSON.stringify(updated));
  };

  const deleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem('ranaji-contacts', JSON.stringify(updated));
  };

  const value = {
    isAuthenticated,
    adminUser,
    login,
    logout,
    collections,
    addCollection,
    updateCollection,
    deleteCollection,
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    gallery,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    services,
    addService,
    updateService,
    deleteService,
    bookings,
    addBooking,
    updateBookingStatus,
    deleteBooking,
    contacts,
    addContact,
    markContactAsRead,
    deleteContact,
    stats: {
      totalCollections: collections.length,
      totalTestimonials: testimonials.length,
      totalGallery: gallery.length,
      totalServices: services.length,
      totalBookings: bookings.length,
      totalContacts: contacts.length,
      unreadContacts: contacts.filter(c => !c.read).length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length
    }
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
