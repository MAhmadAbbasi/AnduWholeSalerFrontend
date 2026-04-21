// Agricultural product image utilities with Unsplash fallbacks

// Unsplash agricultural product images (high quality, reliable)
const unsplashClothingImages = [
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop', // Fresh vegetables
  'https://images.unsplash.com/photo-1518977676601-b53f82ber7a0?w=800&h=800&fit=crop', // Organic produce
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=800&fit=crop', // Fresh fruits
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop', // Grocery vegetables
  'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=800&h=800&fit=crop', // Farm produce
  'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=800&fit=crop', // Green vegetables
  'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&h=800&fit=crop', // Leafy greens
  'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&h=800&fit=crop', // Apples
  'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=800&h=800&fit=crop', // Strawberries
  'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&h=800&fit=crop'  // Fresh tomatoes
];

// Unsplash hero/banner images for backgrounds
const unsplashHeroImages = [
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=2280&h=1080&fit=crop', // Golden wheat field
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=2280&h=1080&fit=crop', // Green farmland
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=2280&h=1080&fit=crop', // Farm landscape
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=2280&h=1080&fit=crop', // Vegetable garden
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=2280&h=1080&fit=crop'  // Organic farm
];

// Local clothing images (from assets)
const localClothingImages = [
  '/assets/images/Ankle_Banner_1944x.jpg'
];

/**
 * Get clothing product image with Unsplash fallback
 * @param {string} imagePath - Image path from API or local
 * @param {number} index - Index for cycling through images
 * @returns {string} Image URL
 */
export const getClothingImage = (imagePath, index = 0) => {
  // If no image path provided, use local first, then Unsplash
  if (!imagePath) {
    return localClothingImages[index % localClothingImages.length] || 
           unsplashClothingImages[index % unsplashClothingImages.length];
  }
  
  // Check if it's a grocery image path
  if (imagePath.includes('/assets/imgs/shop/product-') || 
      imagePath.includes('/assets/imgs/shop/thumbnail-') ||
      (imagePath.includes('product-') && imagePath.includes('.jpg') && !imagePath.includes('/assets/images/'))) {
    // Replace with local clothing image, fallback to Unsplash
    return localClothingImages[index % localClothingImages.length] || 
           unsplashClothingImages[index % unsplashClothingImages.length];
  }
  
  // If it's already a clothing image or external URL, use it
  return imagePath;
};

/**
 * Get hero/banner background image with Unsplash fallback
 * @param {string} imagePath - Image path
 * @param {number} index - Index for cycling
 * @returns {string} Image URL
 */
export const getHeroImage = (imagePath, index = 0) => {
  if (!imagePath || imagePath.includes('/assets/imgs/')) {
    // Use local hero images first, then Unsplash
    const localHeroImages = [
      '/assets/images/Ankle_Banner_1944x.jpg'
    ];
    return localHeroImages[index % localHeroImages.length] || 
           unsplashHeroImages[index % unsplashHeroImages.length];
  }
  return imagePath;
};

/**
 * Get Unsplash fallback image for onError handlers
 * @param {number} index - Index for variety
 * @returns {string} Unsplash image URL
 */
export const getUnsplashFallback = (index = 0) => {
  return unsplashClothingImages[index % unsplashClothingImages.length];
};

/**
 * Get Unsplash hero fallback
 * @param {number} index - Index for variety
 * @returns {string} Unsplash hero image URL
 */
export const getUnsplashHeroFallback = (index = 0) => {
  return unsplashHeroImages[index % unsplashHeroImages.length];
};

/**
 * Get full image URL with base domain
 * @param {string} imagePath - Relative or absolute image path
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Keep data/blob URLs as-is
  if (imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  // If already absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Prepend correct base origin for relative paths.
  // Prefer REACT_APP_API_URL (strip `/api`), otherwise fall back to current origin.
  let origin = '';
  try {
    const apiBase = process.env.REACT_APP_API_URL;
    if (apiBase) {
      origin = new URL(apiBase).origin;
    } else if (typeof window !== 'undefined' && window.location?.origin) {
      origin = window.location.origin;
    }
  } catch {
    // ignore
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
};

// Export arrays for direct use
export { localClothingImages, unsplashClothingImages, unsplashHeroImages };

