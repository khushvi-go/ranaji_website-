import { createContext, useContext, useState, useEffect } from 'react';
import { defaultCategories, defaultProducts } from '../data/initialShopData';

const ShopContext = createContext();

const PRODUCTS_STORAGE_KEY = 'ranaji_store_products_v2';
const CATEGORIES_STORAGE_KEY = 'ranaji_store_categories_v2';

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  // Initialize categories from localStorage or default
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load categories from storage', e);
    }
    return defaultCategories;
  });

  // Initialize products from localStorage or default
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load products from storage', e);
    }
    return defaultProducts;
  });

  // Persist categories
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }, [categories]);

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  }, [products]);

  // --- CATEGORY CRUD ---

  const addCategory = (categoryData) => {
    const slug = (categoryData.slug || categoryData.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');
    
    const newCategory = {
      id: slug || `cat-${Date.now()}`,
      name: categoryData.name,
      slug,
      description: categoryData.description || '',
      image: categoryData.image || '/images/image.png',
      subcategories: Array.isArray(categoryData.subcategories) ? categoryData.subcategories : [],
      isActive: categoryData.isActive !== false,
      createdAt: new Date().toISOString()
    };

    setCategories((prev) => [...prev, newCategory]);
    return { success: true, category: newCategory };
  };

  const updateCategory = (categoryId, updatedFields) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, ...updatedFields } : cat))
    );
    return { success: true };
  };

  const deleteCategory = (categoryId) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    return { success: true };
  };

  const addSubcategory = (categoryId, subcategoryName) => {
    const trimmed = subcategoryName.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        if (cat.subcategories.includes(trimmed)) return cat;
        return {
          ...cat,
          subcategories: [...cat.subcategories, trimmed]
        };
      })
    );
  };

  const removeSubcategory = (categoryId, subcategoryName) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.filter((s) => s !== subcategoryName)
        };
      })
    );
  };

  // --- PRODUCT CRUD ---

  const addProduct = (productData) => {
    const newId = products.length > 0 ? Math.max(...products.map((p) => Number(p.id) || 0)) + 1 : 1;
    
    const formattedPrice = typeof productData.price === 'number'
      ? `₹${productData.price.toLocaleString('en-IN')}`
      : (productData.price?.toString().startsWith('₹') ? productData.price : `₹${productData.price}`);

    const newProduct = {
      id: newId,
      name: productData.name,
      category: productData.category || 'groom',
      subcategory: productData.subcategory || 'Sherwani',
      price: Number(productData.price) || 0,
      rentPrice: Number(productData.rentPrice) || Math.round((Number(productData.price) || 0) * 0.3),
      priceType: productData.priceType || 'Starting Price',
      description: productData.description || '',
      image: productData.image || '/images/image.png',
      images: Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images
        : [productData.image || '/images/image.png'],
      available: Array.isArray(productData.available) && productData.available.length > 0
        ? productData.available
        : ['rent', 'purchase'],
      sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0
        ? productData.sizes
        : ['38 (M)', '40 (L)', '42 (XL)', 'Custom Fit'],
      fabric: productData.fabric || 'Royal Silk',
      color: productData.color || 'Royal Classic',
      stock: Number(productData.stock) || 5,
      featured: Boolean(productData.featured),
      rating: Number(productData.rating) || 5.0,
      reviewsCount: Number(productData.reviewsCount) || 1,
      badge: productData.badge || (productData.featured ? 'Featured' : ''),
      createdAt: new Date().toISOString()
    };

    setProducts((prev) => [newProduct, ...prev]);
    return { success: true, product: newProduct };
  };

  const updateProduct = (productId, updatedFields) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId || String(item.id) === String(productId)) {
          const merged = { ...item, ...updatedFields };
          if (updatedFields.price !== undefined) {
            merged.price = Number(updatedFields.price);
          }
          if (updatedFields.rentPrice !== undefined) {
            merged.rentPrice = Number(updatedFields.rentPrice);
          }
          return merged;
        }
        return item;
      })
    );
    return { success: true };
  };

  const deleteProduct = (productId) => {
    setProducts((prev) =>
      prev.filter((item) => item.id !== productId && String(item.id) !== String(productId))
    );
    return { success: true };
  };

  const resetToDefaults = () => {
    setCategories(defaultCategories);
    setProducts(defaultProducts);
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  };

  // Helper queries
  const getProductById = (id) => {
    return products.find((p) => String(p.id) === String(id));
  };

  const getCategoryById = (id) => {
    return categories.find((c) => c.id === id || c.slug === id);
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
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    removeSubcategory,
    resetToDefaults,
    getProductById,
    getCategoryById,
    getSubcategories
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
