import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live categories and products from MongoDB Atlas
  const fetchShopData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        categoriesAPI.getAll('?all=true'),
        productsAPI.getAll('?all=true')
      ]);

      const loadedCategories = Array.isArray(catsRes)
        ? catsRes
        : catsRes.data || [];

      const loadedProducts = Array.isArray(prodsRes)
        ? prodsRes
        : prodsRes.data || [];

      setCategories(loadedCategories);
      setProducts(loadedProducts);
    } catch (err) {
      console.error('Failed to load shop catalog from MongoDB Atlas:', err);
      setError(err.message || 'Unable to connect to Ranaji database');
      toast.error('Unable to load live catalog from database: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  // --- CATEGORY CRUD WITH REAL MONGODB PERSISTENCE ---

  const addCategory = async (categoryData) => {
    try {
      const res = await categoriesAPI.create(categoryData);
      const newCat = res.data || res;
      setCategories((prev) => [...prev, newCat]);
      toast.success(`Category "${newCat.name}" created in MongoDB Atlas!`);
      return { success: true, category: newCat };
    } catch (err) {
      toast.error('Failed to create category: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  const updateCategory = async (categoryId, updatedFields) => {
    try {
      const res = await categoriesAPI.update(categoryId, updatedFields);
      const updated = res.data || res;
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId || cat._id === categoryId ? { ...cat, ...updated } : cat))
      );
      toast.success('Category updated in MongoDB Atlas');
      return { success: true, category: updated };
    } catch (err) {
      toast.error('Failed to update category: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await categoriesAPI.delete(categoryId);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId && cat._id !== categoryId));
      toast.success('Category deleted from database');
      return { success: true };
    } catch (err) {
      toast.error('Failed to delete category: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  const addSubcategory = async (categoryId, subcategoryName) => {
    const trimmed = subcategoryName.trim();
    if (!trimmed) return;
    const cat = categories.find((c) => c.id === categoryId || c._id === categoryId);
    if (!cat) return;
    const currentSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    if (currentSubs.includes(trimmed)) return;
    const updatedSubs = [...currentSubs, trimmed];
    return updateCategory(categoryId, { subcategories: updatedSubs });
  };

  const removeSubcategory = async (categoryId, subcategoryName) => {
    const cat = categories.find((c) => c.id === categoryId || c._id === categoryId);
    if (!cat) return;
    const currentSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    const updatedSubs = currentSubs.filter((s) => s !== subcategoryName);
    return updateCategory(categoryId, { subcategories: updatedSubs });
  };

  // --- PRODUCT CRUD WITH REAL MONGODB PERSISTENCE ---

  const addProduct = async (productData) => {
    try {
      const res = await productsAPI.create(productData);
      const newProd = res.data || res;
      setProducts((prev) => [newProd, ...prev]);
      toast.success(`Royal ensemble "${newProd.name}" saved to MongoDB Atlas!`);
      return { success: true, product: newProd };
    } catch (err) {
      toast.error('Failed to save product: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  const updateProduct = async (productId, updatedFields) => {
    try {
      const res = await productsAPI.update(productId, updatedFields);
      const updated = res.data || res;
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId || item._id === productId || String(item.id) === String(productId)
            ? { ...item, ...updated }
            : item
        )
      );
      toast.success('Product updated in database');
      return { success: true, product: updated };
    } catch (err) {
      toast.error('Failed to update product: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await productsAPI.delete(productId);
      setProducts((prev) =>
        prev.filter((item) => item.id !== productId && item._id !== productId && String(item.id) !== String(productId))
      );
      toast.success('Product removed from database');
      return { success: true };
    } catch (err) {
      toast.error('Failed to delete product: ' + err.message);
      return { success: false, message: err.message };
    }
  };

  // Helper queries
  const getProductById = (id) => {
    return products.find(
      (p) => String(p.id) === String(id) || String(p._id) === String(id) || p.slug === id
    );
  };

  const getCategoryById = (id) => {
    return categories.find(
      (c) => String(c.id) === String(id) || String(c._id) === String(id) || c.slug === id
    );
  };

  const getSubcategories = (categoryId) => {
    if (!categoryId || categoryId === 'all') {
      const allSub = new Set();
      categories.forEach((cat) => cat.subcategories?.forEach((sub) => allSub.add(sub)));
      return Array.from(allSub);
    }
    const cat = getCategoryById(categoryId);
    return cat?.subcategories || [];
  };

  const value = {
    categories,
    products,
    loading,
    error,
    refreshShopData: fetchShopData,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    removeSubcategory,
    getProductById,
    getCategoryById,
    getSubcategories
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
