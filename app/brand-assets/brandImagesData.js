// /app/brand-assets/brandImagesData.js
// SINGLE SOURCE OF TRUTH for all brand images
// Edit this file to add/remove/update images - everything else updates automatically

/**
 * Central data source for Do It With AI Tools brand images
 * Used by:
 * - BrandAssetsClient.jsx (displays images)
 * - page.js (generates schema)
 * - image-sitemap.xml/route.js (generates XML sitemap)
 */

export const brandImages = [
 {
    id: 'logo-header',
    src: '/logoForHeader.png',
    alt: 'Do It With AI Tools Official Logo',
    title: 'Official Header Logo',
    description: 'Official Do It With AI Tools logo used in website header and footer. Features brand color #5271ff with transparent background, suitable for both light and dark themes.',
    width: 600,
    height: 60,
    format: 'PNG',
    category: 'Primary Logos',
    keywords: 'do it with ai tools, doitwithai.tools, official logo, header logo',
    copyrightHolder: 'Do It With AI Tools',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    publishedAt: '2024-01-01',
    featured: true,
  },
  
  {
    id: 'logo-round-brand',
    src: '/do-it-with-ai-tools-logo-with-brand-name-included.png',
    alt: 'Do It With AI Tools Round Logo with Brand Name',
    title: 'Round Logo with Brand Name',
    description: 'Round logo with #5271ff background and white logo design. Includes "Do It With AI Tools" brand name, perfect for profile pictures and branding materials.',
    width: 512,
    height: 512,
    format: 'PNG',
    category: 'Primary Logos',
    keywords: 'do it with ai tools, round logo, brand circle, profile picture',
    copyrightHolder: 'Do It With AI Tools',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    publishedAt: '2024-01-01',
    featured: true,
  },
  
  {
    id: 'logo-square',
    src: '/doitwithai-logo-square.png',
    alt: 'Do It With AI Tools Square Logo',
    title: 'Square Logo',
    description: 'Square format logo with #5271ff background and white logo design. Optimized for social media profiles, app icons, and square placements.',
    width: 512,
    height: 512,
    format: 'PNG',
    category: 'Primary Logos',
    keywords: 'do it with ai tools, square logo, social media logo, app icon',
    copyrightHolder: 'Do It With AI Tools',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    publishedAt: '2024-01-01',
    featured: false,
  },
  
  {
    id: 'logo-transparent',
    src: '/doitwithai-transparent-logo.png',
    alt: 'Do It With AI Tools Transparent Logo',
    title: 'Transparent Adaptive Logo',
    description: 'Round #5271ff circle with transparent logo design. Automatically adapts to both dark and light modes without color borders, ensuring consistent branding across all themes.',
    width: 512,
    height: 512,
    format: 'PNG',
    category: 'Adaptive Logos',
    keywords: 'do it with ai tools, transparent logo, dark mode logo, adaptive logo',
    copyrightHolder: 'Do It With AI Tools',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    publishedAt: '2024-01-01',
    featured: false,
  },
  
  {
    id: 'logo-png-round',
    src: '/Png-Logo-of-Do-it-with-ai-tools.png',
    alt: 'Do It With AI Tools PNG Round Logo',
    title: 'Round PNG Logo',
    description: 'Round logo with #5271ff background and white logo symbol. High-quality PNG format ideal for presentations, marketing materials, and print media.',
    width: 512,
    height: 512,
    format: 'PNG',
    category: 'Primary Logos',
    keywords: 'do it with ai tools, png logo, round logo, brand asset',
    copyrightHolder: 'Do It With AI Tools',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    publishedAt: '2024-01-01',
    featured: false,
  },
  
  {
    id: 'homepage-screenshot',
    src: '/homepage-hero-screenshot.png',
    alt: 'Do It With AI Tools Homepage Screenshot',
    title: 'Homepage Screenshot',
    description: 'High-quality screenshot of Do It With AI Tools homepage hero section showcasing the modern AI hub interface, key features, and value propositions.',
    width: 1920,
    height: 1080,
    format: 'PNG',
    category: 'Screenshots',
    keywords: 'do it with ai tools, homepage, platform interface, website screenshot',
    copyrightHolder: 'Do It With AI Tools',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    publishedAt: '2024-02-01',
    featured: true,
  },
  
  {
    id: 'homepage-demo',
    src: '/doitwithai-homepage-animated.gif',
    alt: 'Do It With AI Tools Homepage Animated Demo',
    title: 'Animated Platform Demo',
    description: 'Animated GIF demonstration of Do It With AI Tools platform showing navigation, content sections, and interactive features in action.',
    width: 1200,
    height: 675,
    format: 'GIF',
    category: 'Demos',
    keywords: 'do it with ai tools, animated demo, platform demo, gif animation',
    copyrightHolder: 'Do It With AI Tools',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    publishedAt: '2024-02-01',
    featured: true,
  },
  
  {
    id: 'og-image',
    src: '/og.png',
    alt: 'Do It With AI Tools Social Media Share Image',
    title: 'Social Media OG Image',
    description: 'Default Open Graph image for Do It With AI Tools website. Displayed when shared on social media platforms including Facebook, Twitter, LinkedIn, and WhatsApp.',
    width: 1200,
    height: 630,
    format: 'PNG',
    category: 'Social Media',
    keywords: 'do it with ai tools, og image, social sharing, open graph',
    copyrightHolder: 'Do It With AI Tools',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    publishedAt: '2024-01-01',
    featured: false,
  },
  
  {
    id: 'founder-photo',
    src: '/sufian-mustafa-founder-doitwithaitools.png',
    width: 800,
    height: 800,
    format: 'PNG',
    size: '120 KB',
    alt: 'Sufian Mustafa - Founder of Do It With AI Tools',
    title: 'Sufian Mustafa, Founder & AI Content Strategist',
    description: 'Professional headshot of Sufian Mustafa, founder and AI content strategist at Do It With AI Tools. Experienced in AI-powered content creation, SEO optimization, and digital strategy.',
    keywords: 'sufian mustafa, do it with ai tools founder, ai content strategist',
    category: 'Team',
    copyrightHolder: 'Sufian Mustafa',
    creator: 'Sufian Mustafa',
    license: 'https://doitwithai.tools/license',
    featured: true,
    publishedAt: '2024-01-01',
  }
];

/**
 * Get all unique categories from images
 * @returns {string[]} Array of category names with 'All' prepended
 */
export function getCategories() {
  const uniqueCategories = [...new Set(brandImages.map(img => img.category))];
  return ['All', ...uniqueCategories.sort()];
}

/**
 * Filter images by category
 * @param {string} category - Category name or 'All'
 * @returns {Array} Filtered array of images
 */
export function getImagesByCategory(category) {
  if (category === 'All' || !category) {
    return brandImages;
  }
  return brandImages.filter(img => img.category === category);
}

/**
 * Get featured images only
 * @returns {Array} Array of featured images
 */
export function getFeaturedImages() {
  return brandImages.filter(img => img.featured === true);
}

/**
 * Get image by ID
 * @param {string} id - Image identifier
 * @returns {Object|undefined} Image object or undefined
 */
export function getImageById(id) {
  return brandImages.find(img => img.id === id);
}

/**
 * Get images for specific page context
 * @param {string} page - Page identifier ('homepage', 'brand-assets', 'about')
 * @returns {Array} Relevant images for that page
 */
export function getImagesForPage(page) {
  switch (page) {
    case 'homepage':
      return brandImages.filter(img => 
        img.id === 'logo-header' || 
        img.id === 'homepage-screenshot'
      );
    
    case 'brand-assets':
      return brandImages; // All images
    
    case 'about':
      return brandImages.filter(img => 
        img.id === 'founder-photo' || 
        img.id === 'logo-header'
      );
    
    default:
      return [];
  }
}

/**
 * Get total count of images
 * @returns {number} Total number of images
 */
export function getTotalImageCount() {
  return brandImages.length;
}

/**
 * Get images sorted by publish date (newest first)
 * @returns {Array} Sorted array of images
 */
export function getImagesByDate() {
  return [...brandImages].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );
}

// Export default for convenience
export default {
  brandImages,
  getCategories,
  getImagesByCategory,
  getFeaturedImages,
  getImageById,
  getImagesForPage,
  getTotalImageCount,
  getImagesByDate
};

/**
 * USAGE EXAMPLES:
 * 
 * // In components:
 * import { brandImages, getCategories } from './brandImagesData';
 * 
 * // Get all images
 * const images = brandImages;
 * 
 * // Get categories
 * const categories = getCategories(); // ['All', 'Logos', 'Screenshots', ...]
 * 
 * // Filter by category
 * const logos = getImagesByCategory('Logos');
 * 
 * // Get featured only
 * const featured = getFeaturedImages();
 * 
 * // Get for specific page
 * const homepageImages = getImagesForPage('homepage');
 * 
 * // Get single image
 * const logo = getImageById('logo-header');
 */