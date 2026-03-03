import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, collectionsAPI, testimonialsAPI, galleryAPI, servicesAPI, bookingsAPI, contactsAPI } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [collections, setCollections] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Load data on mount
  useEffect(() => {
    const token = localStorage.getItem('ranaji-admin-token');
    if (token) {
      // Verify token validity
      authAPI.verifyToken()
        .then(response => {
          if (response.valid) {
            setIsAuthenticated(true);
            setAdminUser(response.user);
          } else {
            localStorage.removeItem('ranaji-admin-token');
          }
        })
        .catch(() => {
          localStorage.removeItem('ranaji-admin-token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Fetch public data
    fetchPublicData();
  }, []);

  // Fetch all public data
  const fetchPublicData = async () => {
    try {
      const [collectionsRes, testimonialsRes, galleryRes, servicesRes] = await Promise.all([
        collectionsAPI.getAll('?active=true'),
        testimonialsAPI.getAll('?active=true'),
        galleryAPI.getAll('?active=true'),
        servicesAPI.getAll('?active=true'),
      ]);
      
      setCollections(collectionsRes.data || []);
      setTestimonials(testimonialsRes.data || []);
      setGallery(galleryRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error fetching public data:', error);
    }
  };

  // Fetch admin data (bookings, contacts)
  const fetchAdminData = async () => {
    if (!isAuthenticated) return;
    
    try {
      const [bookingsRes, contactsRes] = await Promise.all([
        bookingsAPI.getAll(),
        contactsAPI.getAll(),
      ]);
      
      setBookings(bookingsRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Load admin data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  // Auth functions
  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      
      if (response.success) {
        setIsAuthenticated(true);
        setAdminUser(response.user);
        localStorage.setItem('ranaji-admin-token', response.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('ranaji-admin-token');
    setBookings([]);
    setContacts([]);
  };

  // Collections
  const addCollection = async (collection) => {
    try {
      const response = await collectionsAPI.create(collection);
      setCollections([...collections, response.data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateCollection = async (id, updatedData) => {
    try {
      const response = await collectionsAPI.update(id, updatedData);
      setCollections(collections.map(c => c._id === id ? response.data : c));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteCollection = async (id) => {
    try {
      await collectionsAPI.delete(id);
      setCollections(collections.filter(c => c._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Testimonials
  const addTestimonial = async (testimonial) => {
    try {
      const response = await testimonialsAPI.create(testimonial);
      setTestimonials([...testimonials, response.data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateTestimonial = async (id, updatedData) => {
    try {
      const response = await testimonialsAPI.update(id, updatedData);
      setTestimonials(testimonials.map(t => t._id === id ? response.data : t));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteTestimonial = async (id) => {
    try {
      await testimonialsAPI.delete(id);
      setTestimonials(testimonials.filter(t => t._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Gallery
  const addGalleryImage = async (image) => {
    try {
      const response = await galleryAPI.create(image);
      setGallery([...gallery, response.data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateGalleryImage = async (id, updatedData) => {
    try {
      const response = await galleryAPI.update(id, updatedData);
      setGallery(gallery.map(g => g._id === id ? response.data : g));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteGalleryImage = async (id) => {
    try {
      await galleryAPI.delete(id);
      setGallery(gallery.filter(g => g._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Services
  const addService = async (service) => {
    try {
      const response = await servicesAPI.create(service);
      setServices([...services, response.data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateService = async (id, updatedData) => {
    try {
      const response = await servicesAPI.update(id, updatedData);
      setServices(services.map(s => s._id === id ? response.data : s));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteService = async (id) => {
    try {
      await servicesAPI.delete(id);
      setServices(services.filter(s => s._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Bookings
  const addBooking = async (booking) => {
    try {
      const response = await bookingsAPI.create(booking);
      setBookings([...bookings, response.data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const response = await bookingsAPI.update(id, { status });
      setBookings(bookings.map(b => b._id === id ? response.data : b));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteBooking = async (id) => {
    try {
      await bookingsAPI.delete(id);
      setBookings(bookings.filter(b => b._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Contacts
  const addContact = async (contact) => {
    try {
      const response = await contactsAPI.create(contact);
      setContacts([...contacts, response.data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const markContactAsRead = async (id) => {
    try {
      const response = await contactsAPI.markAsRead(id);
      setContacts(contacts.map(c => c._id === id ? response.data : c));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteContact = async (id) => {
    try {
      await contactsAPI.delete(id);
      setContacts(contacts.filter(c => c._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = {
    isAuthenticated,
    adminUser,
    loading,
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
    refreshData: fetchPublicData,
    refreshAdminData: fetchAdminData,
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
