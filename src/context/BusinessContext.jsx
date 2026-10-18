import { createContext, useContext, useState, useEffect } from 'react';
import { useShop } from './ShopContext';
import { 
  defaultCustomers, 
  defaultSales, 
  defaultRentals, 
  defaultInventoryMovements 
} from '../data/initialBusinessData';

const BusinessContext = createContext();

const SALES_KEY = 'ranaji_showroom_sales_v1';
const CUSTOMERS_KEY = 'ranaji_showroom_customers_v1';
const RENTALS_KEY = 'ranaji_showroom_rentals_v1';
const INVENTORY_MOVEMENTS_KEY = 'ranaji_showroom_inventory_movements_v1';
const INVOICE_SEQ_KEY = 'ranaji_showroom_invoice_seq_v1';

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const { products, updateProduct } = useShop();

  // 1. Sales
  const [sales, setSales] = useState(() => {
    try {
      const saved = localStorage.getItem(SALES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading sales', e);
    }
    return defaultSales;
  });

  // 2. Customers
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOMERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading customers', e);
    }
    return defaultCustomers;
  });

  // 3. Rentals
  const [rentals, setRentals] = useState(() => {
    try {
      const saved = localStorage.getItem(RENTALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading rentals', e);
    }
    return defaultRentals;
  });

  // 4. Inventory Movements
  const [inventoryMovements, setInventoryMovements] = useState(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_MOVEMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading movements', e);
    }
    return defaultInventoryMovements;
  });

  // Persist states
  useEffect(() => {
    try { localStorage.setItem(SALES_KEY, JSON.stringify(sales)); } catch (e) {}
  }, [sales]);

  useEffect(() => {
    try { localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers)); } catch (e) {}
  }, [customers]);

  useEffect(() => {
    try { localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals)); } catch (e) {}
  }, [rentals]);

  useEffect(() => {
    try { localStorage.setItem(INVENTORY_MOVEMENTS_KEY, JSON.stringify(inventoryMovements)); } catch (e) {}
  }, [inventoryMovements]);

  // Helper: Next Invoice Number
  const getNextInvoiceNumber = () => {
    let nextNum = 2;
    try {
      const saved = localStorage.getItem(INVOICE_SEQ_KEY);
      if (saved) nextNum = Number(saved) + 1;
      else if (sales.length > 0) nextNum = sales.length + 1;
    } catch (e) {}
    localStorage.setItem(INVOICE_SEQ_KEY, String(nextNum));
    const pad = String(nextNum).padStart(4, '0');
    return `RNJ-${new Date().getFullYear()}-${pad}`;
  };

  /**
   * ATOMIC SALE RECORDING & INVENTORY DEDUCTION
   */
  const recordSale = (saleData) => {
    const invoiceNumber = saleData.invoiceNumber || getNextInvoiceNumber();
    const now = new Date().toISOString();

    // 1. Check stock and update inventory safely
    const newMovements = [];
    saleData.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.id || String(p.id) === String(item.id));
      if (prod) {
        const currentStock = Number(prod.stock) || 0;
        const qty = Number(item.quantity) || 1;
        const newStock = Math.max(0, currentStock - qty);
        
        // Update product stock in shop context
        updateProduct(prod.id, { stock: newStock });

        // Log movement
        newMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          date: now,
          productName: prod.name,
          sku: item.sku || `RNJ-SKU-${prod.id}`,
          change: -qty,
          balance: newStock,
          type: item.mode === 'rent' ? 'RENTAL_OUT' : 'SALE',
          reference: `Invoice #${invoiceNumber}`,
          actor: saleData.cashier || 'Showroom Staff'
        });
      }
    });

    if (newMovements.length > 0) {
      setInventoryMovements((prev) => [...newMovements, ...prev]);
    }

    // 2. Link or create customer
    let customerRef = saleData.customer;
    if (customerRef?.phone) {
      const existing = customers.find((c) => c.phone.replace(/\D/g, '') === customerRef.phone.replace(/\D/g, ''));
      if (existing) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === existing.id) {
              return {
                ...c,
                totalSpent: (c.totalSpent || 0) + (saleData.calculation.grandTotal || 0),
                ordersCount: (c.ordersCount || 0) + 1,
                lastOrderDate: now
              };
            }
            return c;
          })
        );
        customerRef = { ...existing, ...customerRef };
      } else {
        const newCust = {
          id: `cust-${Date.now()}`,
          name: customerRef.name || 'Walk-in Customer',
          phone: customerRef.phone,
          email: customerRef.email || '',
          city: customerRef.city || 'Udaipur',
          address: customerRef.address || '',
          totalSpent: saleData.calculation.grandTotal || 0,
          ordersCount: 1,
          balance: saleData.calculation.balanceRemaining || 0,
          measurements: customerRef.measurements || {},
          notes: customerRef.notes || '',
          createdAt: now
        };
        setCustomers((prev) => [newCust, ...prev]);
        customerRef = newCust;
      }
    }

    // 3. Construct completed sale entity
    const newSale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      date: now,
      customer: customerRef,
      items: saleData.items,
      calculation: saleData.calculation,
      payments: saleData.payments || [],
      cashier: saleData.cashier || 'Admin (Showroom POS)',
      register: saleData.register || 'Counter 01',
      notes: saleData.notes || ''
    };

    setSales((prev) => [newSale, ...prev]);
    return { success: true, sale: newSale };
  };

  /**
   * INVENTORY ADJUSTMENT WITH AUDIT TRAIL
   */
  const adjustStock = (productId, delta, reason = 'Inventory Count Adjustment', actor = 'Admin') => {
    const prod = products.find((p) => p.id === productId || String(p.id) === String(productId));
    if (!prod) return { success: false, message: 'Product not found' };

    const currentStock = Number(prod.stock) || 0;
    const newStock = Math.max(0, currentStock + Number(delta));

    updateProduct(prod.id, { stock: newStock });

    const newMov = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString(),
      productName: prod.name,
      sku: prod.sku || `RNJ-SKU-${prod.id}`,
      change: Number(delta),
      balance: newStock,
      type: delta >= 0 ? 'RESTOCK' : 'CORRECTION',
      reference: reason,
      actor
    };

    setInventoryMovements((prev) => [newMov, ...prev]);
    return { success: true, balance: newStock };
  };

  // Customer Management
  const addCustomer = (customerData) => {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...customerData,
      totalSpent: 0,
      ordersCount: 0,
      balance: 0,
      createdAt: new Date().toISOString()
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return { success: true, customer: newCustomer };
  };

  const updateCustomer = (customerId, updatedFields) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updatedFields } : c))
    );
    return { success: true };
  };

  // Rental Management
  const addRental = (rentalData) => {
    const rentalNumber = `RNT-${new Date().getFullYear()}-${String(rentals.length + 1).padStart(4, '0')}`;
    const newRental = {
      id: `rent-${Date.now()}`,
      rentalNumber,
      createdAt: new Date().toISOString(),
      ...rentalData,
      status: rentalData.status || 'RESERVED'
    };
    setRentals((prev) => [newRental, ...prev]);
    return { success: true, rental: newRental };
  };

  const updateRentalStatus = (rentalId, status, returnNotes = '') => {
    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === rentalId) {
          return {
            ...r,
            status,
            returnDateActual: status === 'RETURNED' ? new Date().toISOString() : r.returnDateActual,
            returnNotes: returnNotes || r.returnNotes
          };
        }
        return r;
      })
    );
    return { success: true };
  };

  const value = {
    sales,
    customers,
    rentals,
    inventoryMovements,
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
