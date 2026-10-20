import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  authAPI, 
  collectionsAPI, 
  testimonialsAPI, 
  galleryAPI, 
  servicesAPI, 
  bookingsAPI, 
  contactsAPI,
  dashboardAPI
} from '../services/api';

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
  const [serverStats, setServerStats] = useState(null);

  // Fetch all public showcase data from MongoDB Atlas
  const fetchPublicData = useCallback(async () => {
    try {
      const [collectionsRes, testimonialsRes, galleryRes, servicesRes] = await Promise.all([
        collectionsAPI.getAll('?all=true'),
        testimonialsAPI.getAll('?active=true'),
        galleryAPI.getAll('?active=true'),
        servicesAPI.getAll('?active=true'),
      ]);
      
      setCollections(Array.isArray(collectionsRes) ? collectionsRes : collectionsRes.data || []);
      setTestimonials(Array.isArray(testimonialsRes) ? testimonialsRes : testimonialsRes.data || []);
      setGallery(Array.isArray(galleryRes) ? galleryRes : galleryRes.data || []);
      setServices(Array.isArray(servicesRes) ? servicesRes : servicesRes.data || []);
    } catch (error) {
      console.error('Error fetching public showcase data from MongoDB Atlas:', error);
    }
  }, []);

  // Fetch admin-protected data from MongoDB Atlas
  const fetchAdminData = useCallback(async () => {
    const token = localStorage.getItem('ranaji-admin-token');
    if (!token) return;
    
    try {
      const [bookingsRes, contactsRes, statsRes, testimonialsRes] = await Promise.all([
        bookingsAPI.getAll(),
        contactsAPI.getAll(),
        dashboardAPI.getStats().catch(() => null),
        testimonialsAPI.getAll()
      ]);
      
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : bookingsRes.data || []);
      setContacts(Array.isArray(contactsRes) ? contactsRes : contactsRes.data || []);
      if (testimonialsRes) {
        setTestimonials(Array.isArray(testimonialsRes) ? testimonialsRes : testimonialsRes.data || []);
      }
      if (statsRes && statsRes.data) {
        setServerStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching admin records from MongoDB Atlas:', error);
    }
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('ranaji-admin-token');
    if (token) {
      authAPI.verifyToken()
        .then(response => {
          const staffRoles = ['admin', 'owner', 'manager', 'cashier', 'inventory'];
          if (response.valid && staffRoles.includes(response.user?.role)) {
            setIsAuthenticated(true);
            setAdminUser(response.user);
          } else {
            localStorage.removeItem('ranaji-admin-token');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem('ranaji-admin-token');
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    fetchPublicData();
  }, [fetchPublicData]);

  // Load admin records whenever authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated, fetchAdminData]);

  // Auth functions - Real MongoDB verification
  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ email: username, password });
      
      if (response.success && response.token) {
        setIsAuthenticated(true);
        setAdminUser(response.user);
        localStorage.setItem('ranaji-admin-token', response.token);
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Invalid administrator credentials' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('ranaji-admin-token');
    setBookings([]);
    setContacts([]);
  };

  // Collections (Products) CRUD
  const addCollection = async (collection) => {
    try {
      const response = await collectionsAPI.create(collection);
      const newCol = response.data || response;
      setCollections(prev => [newCol, ...prev]);
      return { success: true, data: newCol };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateCollection = async (id, updatedData) => {
    try {
      const response = await collectionsAPI.update(id, updatedData);
      const updated = response.data || response;
      setCollections(prev => prev.map(c => (c.id === id || c._id === id ? { ...c, ...updated } : c)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteCollection = async (id) => {
    try {
      await collectionsAPI.delete(id);
      setCollections(prev => prev.filter(c => c.id !== id && c._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Testimonials CRUD
  const addTestimonial = async (testimonial) => {
    try {
      const response = await testimonialsAPI.create(testimonial);
      const newT = response.data || response;
      setTestimonials(prev => [newT, ...prev]);
      return { success: true, data: newT };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateTestimonial = async (id, updatedData) => {
    try {
      const response = await testimonialsAPI.update(id, updatedData);
      const updated = response.data || response;
      setTestimonials(prev => prev.map(t => (t.id === id || t._id === id ? { ...t, ...updated } : t)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteTestimonial = async (id) => {
    try {
      await testimonialsAPI.delete(id);
      setTestimonials(prev => prev.filter(t => t.id !== id && t._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const approveTestimonial = async (id) => {
    try {
      const response = await testimonialsAPI.approve(id);
      const updated = response.data || response;
      setTestimonials(prev => prev.map(t => (t.id === id || t._id === id ? { ...t, ...updated, status: 'approved', isActive: true } : t)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const rejectTestimonial = async (id) => {
    try {
      const response = await testimonialsAPI.reject(id);
      const updated = response.data || response;
      setTestimonials(prev => prev.map(t => (t.id === id || t._id === id ? { ...t, ...updated, status: 'rejected', isActive: false } : t)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Gallery CRUD
  const addGalleryImage = async (image) => {
    try {
      const response = await galleryAPI.create(image);
      const newG = response.data || response;
      setGallery(prev => [newG, ...prev]);
      return { success: true, data: newG };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateGalleryImage = async (id, updatedData) => {
    try {
      const response = await galleryAPI.update(id, updatedData);
      const updated = response.data || response;
      setGallery(prev => prev.map(g => (g.id === id || g._id === id ? { ...g, ...updated } : g)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteGalleryImage = async (id) => {
    try {
      await galleryAPI.delete(id);
      setGallery(prev => prev.filter(g => g.id !== id && g._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Services CRUD
  const addService = async (service) => {
    try {
      const response = await servicesAPI.create(service);
      const newS = response.data || response;
      setServices(prev => [...prev, newS]);
      return { success: true, data: newS };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateService = async (id, updatedData) => {
    try {
      const response = await servicesAPI.update(id, updatedData);
      const updated = response.data || response;
      setServices(prev => prev.map(s => (s.id === id || s._id === id ? { ...s, ...updated } : s)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteService = async (id) => {
    try {
      await servicesAPI.delete(id);
      setServices(prev => prev.filter(s => s.id !== id && s._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Bookings CRUD
  const addBooking = async (booking) => {
    try {
      const response = await bookingsAPI.create(booking);
      const newB = response.data || response;
      setBookings(prev => [newB, ...prev]);
      return { success: true, data: newB };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const response = await bookingsAPI.update(id, { status });
      const updated = response.data || response;
      setBookings(prev => prev.map(b => (b.id === id || b._id === id ? { ...b, ...updated } : b)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteBooking = async (id) => {
    try {
      await bookingsAPI.delete(id);
      setBookings(prev => prev.filter(b => b.id !== id && b._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Contacts CRUD
  const addContact = async (contact) => {
    try {
      const response = await contactsAPI.create(contact);
      const newC = response.data || response;
      setContacts(prev => [newC, ...prev]);
      return { success: true, data: newC };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const markContactAsRead = async (id, isRead = true) => {
    try {
      const response = await contactsAPI.markAsRead(id, isRead);
      const updated = response.data || response;
      setContacts(prev => prev.map(c => (c.id === id || c._id === id ? { ...c, ...updated, read: isRead } : c)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const markContactAsReplied = async (id, replyNotes = '') => {
    try {
      const response = await contactsAPI.markAsReplied(id, replyNotes);
      const updated = response.data || response;
      setContacts(prev => prev.map(c => (c.id === id || c._id === id ? { 
        ...c, 
        ...updated, 
        replied: true, 
        read: true, 
        replyNotes: replyNotes || c.replyNotes 
      } : c)));
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteContact = async (id) => {
    try {
      await contactsAPI.delete(id);
      setContacts(prev => prev.filter(c => c.id !== id && c._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const role = adminUser?.role === 'admin' ? 'owner' : (adminUser?.role || 'owner');
  const isOwner = role === 'owner';
  const isManager = role === 'manager';
  const isCashier = role === 'cashier';
  const isInventory = role === 'inventory';

  const permissions = {
    role,
    isOwner,
    isManager,
    isCashier,
    isInventory,
    canManageStaff: isOwner,
    canViewAuditLogs: isOwner || isManager,
    canApprove: isOwner || isManager,
    canRefund: isOwner || isManager,
    canAdjustInventory: isOwner || isManager || isInventory,
    canDeleteProducts: isOwner || isManager,
    canExportCustomers: isOwner || isManager,
    canConfigureSettings: isOwner,
  };

  const value = {
    isAuthenticated,
    adminUser,
    role,
    isOwner,
    isManager,
    isCashier,
    isInventory,
    permissions,
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
    approveTestimonial,
    rejectTestimonial,
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
    markContactAsReplied,
    deleteContact,
    refreshData: fetchPublicData,
    refreshAdminData: fetchAdminData,
    stats: {
      totalCollections: collections.length,
      totalTestimonials: testimonials.length,
      pendingTestimonials: testimonials.filter(t => (t.status || (t.isActive ? 'approved' : 'pending')) === 'pending').length,
      totalGallery: gallery.length,
      totalServices: services.length,
      totalBookings: serverStats?.totalBookings ?? bookings.length,
      totalContacts: serverStats?.totalContacts ?? contacts.length,
      unreadContacts: serverStats?.unreadContacts ?? contacts.filter(c => !c.read).length,
      pendingContacts: contacts.filter(c => !c.replied).length,
      pendingBookings: serverStats?.pendingBookings ?? bookings.filter(b => b.status === 'pending').length
    }
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
