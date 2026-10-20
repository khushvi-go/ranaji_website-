const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const fetchWithAuth = async (endpoint, options = {}) => {
  // Try admin token first, then user token
  const token = localStorage.getItem('ranaji-admin-token') || localStorage.getItem('ranaji-user-token');
  
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
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

// User API (Customer)
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

// Products API (Source of Truth for collections & shop)
export const productsAPI = {
  getAll: (params = '') => fetchWithAuth(`/products${params}`),
  getById: (id) => fetchWithAuth(`/products/${id}`),
  create: (data) => fetchWithAuth('/products', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/products/${id}`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Backwards compatibility alias
export const collectionsAPI = productsAPI;

// Categories API
export const categoriesAPI = {
  getAll: (params = '') => fetchWithAuth(`/categories${params}`),
  getById: (id) => fetchWithAuth(`/categories/${id}`),
  create: (data) => fetchWithAuth('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Orders API (Online orders / customer orders)
export const ordersAPI = {
  getAll: (params = '') => fetchWithAuth(`/orders${params}`),
  getById: (id) => fetchWithAuth(`/orders/${id}`),
  create: (data) => fetchWithAuth('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStatus: (id, status, paymentStatus) => fetchWithAuth(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, paymentStatus }),
  }),
};

// Customers API (Showroom POS & Patron directory)
export const customersAPI = {
  getAll: (params = '') => fetchWithAuth(`/customers${params}`),
  getById: (id) => fetchWithAuth(`/customers/${id}`),
  export: () => fetchWithAuth('/customers/export'),
  create: (data) => fetchWithAuth('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/customers/${id}`, {
    method: 'DELETE',
  }),
};

// Sales API (Showroom POS billing invoices)
export const salesAPI = {
  getAll: (params = '') => fetchWithAuth(`/sales${params}`),
  getById: (id) => fetchWithAuth(`/sales/${id}`),
  getNextInvoiceNumber: () => fetchWithAuth('/sales/next-invoice'),
  create: (data) => fetchWithAuth('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  refund: (id, data) => fetchWithAuth(`/sales/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Inventory API (Stock adjustments and audit movements)
export const inventoryAPI = {
  getMovements: (params = '') => fetchWithAuth(`/inventory${params}`),
  adjustStock: (data) => fetchWithAuth('/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Rentals API
export const rentalsAPI = {
  getAll: (params = '') => fetchWithAuth(`/rentals${params}`),
  create: (data) => fetchWithAuth('/rentals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStatus: (id, status, returnNotes) => fetchWithAuth(`/rentals/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, returnNotes }),
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
  approve: (id) => fetchWithAuth(`/testimonials/${id}/approve`, {
    method: 'PUT',
  }),
  reject: (id) => fetchWithAuth(`/testimonials/${id}/reject`, {
    method: 'PUT',
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
  update: (id, data) => fetchWithAuth(`/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  markAsRead: (id, read = true) => fetchWithAuth(`/contacts/${id}/read`, {
    method: 'PUT',
    body: JSON.stringify({ read }),
  }),
  markAsReplied: (id, replyNotes = '') => fetchWithAuth(`/contacts/${id}/reply`, {
    method: 'PUT',
    body: JSON.stringify({ replyNotes }),
  }),
  delete: (id) => fetchWithAuth(`/contacts/${id}`, {
    method: 'DELETE',
  }),
  getStats: () => fetchWithAuth('/contacts/stats/overview'),
};

// Staff API (Owner only)
export const staffAPI = {
  getAll: () => fetchWithAuth('/staff'),
  create: (data) => fetchWithAuth('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRole: (id, role) => fetchWithAuth(`/staff/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  deactivate: (id, reason) => fetchWithAuth(`/staff/${id}/deactivate`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),
  reactivate: (id) => fetchWithAuth(`/staff/${id}/reactivate`, {
    method: 'PUT',
  }),
};

// Approvals API (High-risk action workflows)
export const approvalsAPI = {
  getAll: (params = '') => fetchWithAuth(`/approvals${params}`),
  getPendingCount: () => fetchWithAuth('/approvals/pending-count'),
  request: (data) => fetchWithAuth('/approvals/request', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  approve: (id, reviewNotes) => fetchWithAuth(`/approvals/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ reviewNotes }),
  }),
  reject: (id, reviewNotes) => fetchWithAuth(`/approvals/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reviewNotes }),
  }),
};

// Audit Logs API (Immutable audit trail)
export const auditLogsAPI = {
  getAll: (params = '') => fetchWithAuth(`/audit-logs${params}`),
};

// Showroom Settings & Security Policies API
export const settingsAPI = {
  get: () => fetchWithAuth('/settings'),
  update: (data) => fetchWithAuth('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Dashboard Stats API
export const dashboardAPI = {
  getStats: () => fetchWithAuth('/dashboard/stats'),
};

export default {
  auth: authAPI,
  user: userAPI,
  products: productsAPI,
  collections: collectionsAPI,
  categories: categoriesAPI,
  orders: ordersAPI,
  customers: customersAPI,
  sales: salesAPI,
  inventory: inventoryAPI,
  rentals: rentalsAPI,
  testimonials: testimonialsAPI,
  gallery: galleryAPI,
  services: servicesAPI,
  bookings: bookingsAPI,
  contacts: contactsAPI,
  staff: staffAPI,
  approvals: approvalsAPI,
  auditLogs: auditLogsAPI,
  settings: settingsAPI,
  dashboard: dashboardAPI,
};
