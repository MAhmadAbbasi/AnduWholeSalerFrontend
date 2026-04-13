// API configuration and base functions
// All storefront calls go through the /storefront prefix on the backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7212/api';
const STOREFRONT = '/storefront';
const TENANT_ID = process.env.REACT_APP_TENANT_ID;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

/**
 * Generic API fetch function
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(TENANT_ID && { 'X-Tenant-Id': TENANT_ID }),
    },
    ...options,
  };

  const token = getAuthToken();
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  if (
    defaultOptions.body &&
    typeof defaultOptions.body === 'object' &&
    !(defaultOptions.body instanceof FormData)
  ) {
    defaultOptions.body = JSON.stringify(defaultOptions.body);
  }

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
      const errorMessage =
        data.message ||
        data.error ||
        (data.errors && Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
        `API Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// ──────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────

export const login = async (email, password) => {
  const response = await apiCall(`${STOREFRONT}/auth/login`, {
    method: 'POST',
    body: { email, password },
  });
  return response;
};

export const register = async (name, email, password, phone = null) => {
  const response = await apiCall(`${STOREFRONT}/auth/register`, {
    method: 'POST',
    body: { customerName: name, email, password, phone },
  });
  return response;
};

// ──────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────

export const getCategories = async () => {
  try {
    const response = await apiCall(`${STOREFRONT}/categories/all`);
    if (response.success && response.data) return response.data;
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await apiCall(`${STOREFRONT}/categories/${id}`);
    if (response.success && response.data) return response.data;
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const getCategoriesHierarchical = async () => {
  try {
    const response = await apiCall(`${STOREFRONT}/categories/all`);
    let categories = [];

    if (response.success && response.data) {
      categories = response.data;
    } else {
      categories = response.data || [];
    }

    // Normalize API response for UI
    const organizedCategories = categories.map((cat) => {
      const normalizedSubCategories = (cat.subCategories || []).map((sub) => {
        const childCats = sub.childCategories || sub.childCategorys || [];
        const subCategory1s =
          (sub.subCategory1s || []).length > 0
            ? sub.subCategory1s
            : childCats.map((cc) => ({
                ...cc,
                subCategoryName: cc.childCategoryName || cc.subCategoryName || cc.name,
                categoryCode: cc.childCategoryCode || cc.categoryCode || cc.code,
              }));

        return { ...sub, subCategory1s };
      });

      const topLevelChildCats = cat.childCategories || cat.childCategorys || [];
      const topLevelSubCategory1s =
        (cat.subCategory1s || []).length > 0
          ? cat.subCategory1s
          : topLevelChildCats.map((cc) => ({
              ...cc,
              subCategoryName: cc.childCategoryName || cc.subCategoryName || cc.name,
              categoryCode: cc.childCategoryCode || cc.categoryCode || cc.code,
            }));

      return {
        ...cat,
        subCategories: normalizedSubCategories,
        subCategory1s: topLevelSubCategory1s,
      };
    });

    return organizedCategories;
  } catch (error) {
    console.error('Error fetching hierarchical categories:', error);
    return [];
  }
};

// ──────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────

export const getProducts = async () => {
  try {
    const response = await apiCall(`${STOREFRONT}/products/all`);
    if (response.success && response.data) return response.data;
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const response = await apiCall(`${STOREFRONT}/products/${id}`);
    if (response.success && response.data) return response.data;
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await apiCall(`${STOREFRONT}/products/category/${categoryId}`);
    if (response.success && response.data) return response.data;
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const getProductsBySubCategory = async (subCategoryId) => {
  try {
    const response = await apiCall(`${STOREFRONT}/products/subcategory/${subCategoryId}`);
    if (response.success && response.data) return response.data;
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    return [];
  }
};

export const getProductsBySubCategory1 = async (subCategory1Id) => {
  // Backend has no third level; fall back to subcategory endpoint
  try {
    const response = await apiCall(`${STOREFRONT}/products/subcategory/${subCategory1Id}`);
    if (response.success && response.data) return response.data;
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products by subcategory1:', error);
    return [];
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await apiCall(
      `${STOREFRONT}/products/search?q=${encodeURIComponent(query)}`
    );
    if (response.success && response.data) return response.data;
    return response.data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// ──────────────────────────────────────────
// ORDERS
// ──────────────────────────────────────────

export const createOrder = async (orderData) => {
  const response = await apiCall(`${STOREFRONT}/orders`, {
    method: 'POST',
    body: orderData,
  });
  if (response.success && response.data) return response.data;
  return response.data || response;
};

export const getOrdersByEmail = async (email) => {
  try {
    const response = await apiCall(
      `${STOREFRONT}/orders/email/${encodeURIComponent(email)}`
    );
    if (response.success && response.data) return response.data;
    return response.data || [];
  } catch (error) {
    console.error('Error fetching orders by email:', error);
    return [];
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await apiCall(`${STOREFRONT}/orders/${id}`);
    if (response.success && response.data) return response.data;
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

export const getOrderByOrderNumber = async (orderNumber) => {
  try {
    const response = await apiCall(
      `${STOREFRONT}/orders/number/${encodeURIComponent(orderNumber)}`
    );
    if (response.success && response.data) return response.data;
    return null;
  } catch (error) {
    console.error('Error fetching order by number:', error);
    return null;
  }
};

// ──────────────────────────────────────────
// CUSTOMER / ACCOUNT
// ──────────────────────────────────────────

export const getCustomerByEmail = async (email) => {
  try {
    const response = await apiCall(
      `${STOREFRONT}/customers/email/${encodeURIComponent(email)}`
    );
    if (response.success && response.data) return response.data;
    return null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
};

export const getCustomerById = async (customerId) => {
  try {
    const response = await apiCall(`${STOREFRONT}/customers/${customerId}`);
    if (response.success && response.data) return response.data;
    return null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
};

export const updateCustomer = async (customerId, customerData) => {
  const response = await apiCall(`${STOREFRONT}/customers/${customerId}`, {
    method: 'PUT',
    body: customerData,
  });
  if (response.success && response.data) return response.data;
  return response.data || response;
};

export const changePassword = async (customerId, passwordData) => {
  const response = await apiCall(
    `${STOREFRONT}/customers/${customerId}/change-password`,
    {
      method: 'POST',
      body: passwordData,
    }
  );
  return response;
};

export const getCustomerAddresses = async (customerId) => {
  try {
    const response = await apiCall(
      `${STOREFRONT}/customers/${customerId}/addresses`
    );
    if (response.success && response.data) return response.data;
    return response.data || [];
  } catch (error) {
    console.error('Error fetching customer addresses:', error);
    return [];
  }
};

export const createOrUpdateAddress = async (customerId, addressData) => {
  const response = await apiCall(
    `${STOREFRONT}/customers/${customerId}/addresses`,
    {
      method: 'POST',
      body: addressData,
    }
  );
  if (response.success && response.data) return response.data;
  return response.data || response;
};

export const deleteAddress = async (customerId, addressId) => {
  const response = await apiCall(
    `${STOREFRONT}/customers/${customerId}/addresses/${addressId}`,
    { method: 'DELETE' }
  );
  return response.success;
};

// ──────────────────────────────────────────
// WISHLIST  (localStorage-only — no backend endpoint)
// ──────────────────────────────────────────

export const getWishlist = async () => {
  try {
    const stored = localStorage.getItem('wishlistItems');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addToWishlist = async (productId) => {
  return { productId };
};

export const removeFromWishlist = async (productId) => {
  return true;
};

export const clearWishlist = async () => {
  return true;
};

// ──────────────────────────────────────────
// COMPARE  (localStorage-only — no backend endpoint)
// ──────────────────────────────────────────

export const getCompareList = async () => {
  try {
    const stored = localStorage.getItem('guestCompareList');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addToCompareList = async (productId) => {
  return { productId };
};

export const removeFromCompareList = async (productId) => {
  return true;
};

export const clearCompareList = async () => {
  return true;
};

// ──────────────────────────────────────────
// CONTACT
// ──────────────────────────────────────────

export const submitContactForm = async (contactData) => {
  console.log('Contact form submitted:', contactData);
  return { success: true };
};

// ──────────────────────────────────────────
// DEPRECATED (kept for backwards-compat)
// ──────────────────────────────────────────

export const getCategoriesPaginated = async (page = 1, pageSize = 10) => {
  const data = await getCategories();
  return { data, totalCount: data.length, page, pageSize };
};

export const getProductsPaginated = async (page = 1, pageSize = 10) => {
  const data = await getProducts();
  return { data, totalCount: data.length, page, pageSize };
};

export const getCustomerProfile = async () => {
  const user = localStorage.getItem('authUser');
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    if (parsed.id) return await getCustomerById(parsed.id);
    return parsed;
  } catch {
    return null;
  }
};

// ──────────────────────────────────────────
// WEB CONTENT (Dynamic sections with local cache)
// ──────────────────────────────────────────

const WEB_CONTENT_CACHE_KEY = 'webContentCache';
const WEB_CONTENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getWebContent = async () => {
  try {
    // Check local cache first
    const cached = localStorage.getItem(WEB_CONTENT_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < WEB_CONTENT_CACHE_TTL) {
        return data;
      }
    }

    const response = await apiCall(`${STOREFRONT}/webcontent`);
    if (response.success && response.data) {
      localStorage.setItem(WEB_CONTENT_CACHE_KEY, JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching web content:', error);
    // Return stale cache on error
    const cached = localStorage.getItem(WEB_CONTENT_CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached).data; } catch { /* noop */ }
    }
    return null;
  }
};

export const invalidateWebContentCache = () => {
  localStorage.removeItem(WEB_CONTENT_CACHE_KEY);
};
