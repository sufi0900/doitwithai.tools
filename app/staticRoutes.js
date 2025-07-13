// config/staticRoutes.js
export const STATIC_ROUTES = [
  // Main pages
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/sitemap',
  
  // Category pages
  '/ai-tools',
  '/ai-seo', 
  '/ai-code',
  '/ai-learn-earn',
  '/free-ai-resources',
  '/ai-news',
  
  // Add any other static pages you have
];

export const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/logo.png', // Add your logo
  '/images/hero-bg.jpg', // Add your static images
  // Add other static assets
];

// Function to get all static routes dynamically
export const getAllStaticRoutes = async () => {
  const routes = [...STATIC_ROUTES];
  
  // If you have any dynamic static routes, add them here
  // For example, if you have category pages that are generated but static
  
  return routes;
};

// Function to get critical assets that should be cached first
export const getCriticalAssets = () => {
  return [
    '/manifest.json',
    '/favicon.ico',
    // Add your most important assets here
  ];
};