const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const fetchWithAuth = async (endpoint, options = {}) => {
  // Try user token first, then admin token
  const token = localStorage.getItem('ranaji-user-token') || localStorage.getItem('ranaji-admin-token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API (Admin)
export const authAPI = {
  login: (credentials) => fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  verifyToken: () => fetchWithAuth('/auth/verify'),
};

// User API
export const userAPI = {
  register: (userData) => fetchWithAuth('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  login: (credentials) => fetchWithAuth('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  verifyToken: () => fetchWithAuth('/users/verify'),
  getProfile: () => fetchWithAuth('/users/profile'),
  updateProfile: (data) => fetchWithAuth('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updatePassword: (data) => fetchWithAuth('/users/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getOrders: () => fetchWithAuth('/users/orders'),
  createOrder: (data) => fetchWithAuth('/users/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Collections API
export const collectionsAPI = {
  getAll: (params = '') => fetchWithAuth(`/collections${params}`),
  getById: (id) => fetchWithAuth(`/collections/${id}`),
  create: (data) => fetchWithAuth('/collections', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/collections/${id}`, {
    method: 'DELETE',
  }),
};

// Testimonials API
export const testimonialsAPI = {
  getAll: (params = '') => fetchWithAuth(`/testimonials${params}`),
  getById: (id) => fetchWithAuth(`/testimonials/${id}`),
  create: (data) => fetchWithAuth('/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/testimonials/${id}`, {
    method: 'DELETE',
  }),
};

// Gallery API
export const galleryAPI = {
  getAll: (params = '') => fetchWithAuth(`/gallery${params}`),
  getById: (id) => fetchWithAuth(`/gallery/${id}`),
  create: (data) => fetchWithAuth('/gallery', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/gallery/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/gallery/${id}`, {
    method: 'DELETE',
  }),
};

// Services API
export const servicesAPI = {
  getAll: (params = '') => fetchWithAuth(`/services${params}`),
  getById: (id) => fetchWithAuth(`/services/${id}`),
  create: (data) => fetchWithAuth('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/services/${id}`, {
    method: 'DELETE',
  }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = '') => fetchWithAuth(`/bookings${params}`),
  getById: (id) => fetchWithAuth(`/bookings/${id}`),
  create: (data) => fetchWithAuth('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/bookings/${id}`, {
    method: 'DELETE',
  }),
  getStats: () => fetchWithAuth('/bookings/stats/overview'),
};

// Contacts API
export const contactsAPI = {
  getAll: (params = '') => fetchWithAuth(`/contacts${params}`),
  getById: (id) => fetchWithAuth(`/contacts/${id}`),
  create: (data) => fetchWithAuth('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  markAsRead: (id) => fetchWithAuth(`/contacts/${id}/read`, {
    method: 'PUT',
  }),
  markAsReplied: (id) => fetchWithAuth(`/contacts/${id}/reply`, {
    method: 'PUT',
  }),
  delete: (id) => fetchWithAuth(`/contacts/${id}`, {
    method: 'DELETE',
  }),
  getStats: () => fetchWithAuth('/contacts/stats/overview'),
};

export default {
  auth: authAPI,
  user: userAPI,
  collections: collectionsAPI,
  testimonials: testimonialsAPI,
  gallery: galleryAPI,
  services: servicesAPI,
  bookings: bookingsAPI,
  contacts: contactsAPI,
};
