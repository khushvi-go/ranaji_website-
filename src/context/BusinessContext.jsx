import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useShop } from './ShopContext';
import { salesAPI, customersAPI, rentalsAPI, inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const { refreshShopData } = useShop();

  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [inventoryMovements, setInventoryMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all business records directly from MongoDB Atlas
  const fetchBusinessData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesRes, customersRes, rentalsRes, movementsRes] = await Promise.all([
        salesAPI.getAll(),
        customersAPI.getAll(),
        rentalsAPI.getAll(),
        inventoryAPI.getMovements()
      ]);

      setSales(Array.isArray(salesRes) ? salesRes : salesRes.data || []);
      setCustomers(Array.isArray(customersRes) ? customersRes : customersRes.data || []);
      setRentals(Array.isArray(rentalsRes) ? rentalsRes : rentalsRes.data || []);
      setInventoryMovements(Array.isArray(movementsRes) ? movementsRes : movementsRes.data || []);
    } catch (err) {
      console.error('Failed to load showroom business records from MongoDB Atlas:', err);
      setError(err.message || 'Error communicating with database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  // Helper: Next Invoice Number from live MongoDB Atlas records
  const getNextInvoiceNumber = async () => {
    try {
      const res = await salesAPI.getNextInvoiceNumber();
      if (res.invoiceNumber) return res.invoiceNumber;
    } catch (e) {}
    const pad = String(sales.length + 1).padStart(4, '0');
    return `RNJ-${new Date().getFullYear()}-${pad}`;
  };

  /**
   * ATOMIC SALE RECORDING & INVENTORY DEDUCTION IN MONGODB ATLAS
   */
  const recordSale = async (saleData) => {
    try {
      const res = await salesAPI.create(saleData);
      const newSale = res.data || res;
      setSales((prev) => [newSale, ...prev]);

      // Re-fetch inventory movements and customers to sync with atomic backend writes
      const [movementsRes, customersRes] = await Promise.all([
        inventoryAPI.getMovements(),
        customersAPI.getAll()
      ]);
      setInventoryMovements(Array.isArray(movementsRes) ? movementsRes : movementsRes.data || []);
      setCustomers(Array.isArray(customersRes) ? customersRes : customersRes.data || []);

      // Refresh shop products so stock numbers immediately reflect in frontend shop
      if (refreshShopData) {
        refreshShopData();
      }

      toast.success(`Tax Invoice #${newSale.invoiceNumber} recorded in MongoDB Atlas!`, {
        icon: '🧾'
      });
      return { success: true, sale: newSale };
    } catch (err) {
      toast.error('Failed to record sale: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  /**
   * INVENTORY ADJUSTMENT WITH AUDIT TRAIL IN MONGODB ATLAS
   */
  const adjustStock = async (productId, delta, reason = 'Inventory Count Adjustment', actor = 'Admin') => {
    try {
      const res = await inventoryAPI.adjustStock({ productId, delta, reason, actor });
      const { balance, movement } = res.data || res;

      if (movement) {
        setInventoryMovements((prev) => [movement, ...prev]);
      }

      if (refreshShopData) {
        refreshShopData();
      }

      toast.success(`Stock adjusted. New balance: ${balance} garments`);
      return { success: true, balance };
    } catch (err) {
      toast.error('Failed to adjust stock: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  // Customer Management
  const addCustomer = async (customerData) => {
    try {
      const res = await customersAPI.create(customerData);
      const newCustomer = res.data || res;
      setCustomers((prev) => [newCustomer, ...prev]);
      toast.success(`Customer "${newCustomer.name}" registered in database`);
      return { success: true, customer: newCustomer };
    } catch (err) {
      toast.error('Failed to add customer: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  const updateCustomer = async (customerId, updatedFields) => {
    try {
      const res = await customersAPI.update(customerId, updatedFields);
      const updated = res.data || res;
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId || c._id === customerId ? { ...c, ...updated } : c))
      );
      toast.success('Customer details updated');
      return { success: true, customer: updated };
    } catch (err) {
      toast.error('Failed to update customer: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  // Rental Management
  const addRental = async (rentalData) => {
    try {
      const res = await rentalsAPI.create(rentalData);
      const newRental = res.data || res;
      setRentals((prev) => [newRental, ...prev]);
      toast.success(`Rental #${newRental.rentalNumber} booked in database`);
      return { success: true, rental: newRental };
    } catch (err) {
      toast.error('Failed to book rental: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  const updateRentalStatus = async (rentalId, status, returnNotes = '') => {
    try {
      const res = await rentalsAPI.updateStatus(rentalId, status, returnNotes);
      const updated = res.data || res;
      setRentals((prev) =>
        prev.map((r) => (r.id === rentalId || r._id === rentalId ? { ...r, ...updated } : r))
      );
      toast.success(`Rental marked as ${status}`);
      return { success: true, rental: updated };
    } catch (err) {
      toast.error('Failed to update rental status: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  const value = {
    sales,
    customers,
    rentals,
    inventoryMovements,
    loading,
    error,
    refreshBusinessData: fetchBusinessData,
    recordSale,
    adjustStock,
    addCustomer,
    updateCustomer,
    addRental,
    updateRentalStatus,
    getNextInvoiceNumber
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};
