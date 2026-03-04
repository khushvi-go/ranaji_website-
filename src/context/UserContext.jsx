import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('ranaji-user-token');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  // Verify token validity
  const verifyToken = async () => {
    try {
      const response = await userAPI.verifyToken();
      if (response.valid) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('ranaji-user-token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('ranaji-user-token');
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      const response = await userAPI.register(userData);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('ranaji-user-token', response.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await userAPI.login({ email, password });
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('ranaji-user-token', response.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ranaji-user-token');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to update profile.' 
      };
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await userAPI.updatePassword({ currentPassword, newPassword });
      if (response.success) {
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to update password.' 
      };
    }
  };

  // Get user orders
  const getOrders = async () => {
    try {
      const response = await userAPI.getOrders();
      if (response.success) {
        return { success: true, orders: response.orders };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch orders.' 
      };
    }
  };

  // Create custom order
  const createOrder = async (orderData) => {
    try {
      const response = await userAPI.createOrder(orderData);
      if (response.success) {
        return { success: true, order: response.order };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to create order.' 
      };
    }
  };

  // Update measurements
  const updateMeasurements = async (measurements) => {
    return updateProfile({ measurements });
  };

  // Update address
  const updateAddress = async (address) => {
    return updateProfile({ address });
  };

  // Update size preferences
  const updateSizePreferences = async (sizePreferences) => {
    return updateProfile({ sizePreferences });
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateProfile,
    updatePassword,
    updateMeasurements,
    updateAddress,
    updateSizePreferences,
    getOrders,
    createOrder,
    isProfileComplete: () => {
      if (!user) return false;
      return user.name && user.phone && user.address?.city;
    },
    hasMeasurements: () => {
      if (!user?.measurements) return false;
      const m = user.measurements;
      return m.chest || m.waist || m.height;
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
