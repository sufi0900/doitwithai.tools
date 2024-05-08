// sitemap.js
import Sitemap from 'next-sitemap';
import { fetchURLs } from '../../app/lib/sanity'; // Adjust the path

export default new Sitemap()
  .add({
    url: 'http://localhost:3000/', // Homepage
    changefreq: 'daily', // Change frequency (e.g., daily)
    priority: 1.0, // Priority (0.0 to 1.0)
  })
  .add({
    url: 'http://localhost:3000/blog', // Blog page
    changefreq: 'weekly',
    priority: 0.8,
  })
  .add({
    url: 'http://localhost:3000/about', // About page
    changefreq: 'monthly',
    priority: 0.5,
  })
  .add(await fetchURLs()) // Add dynamic post URLs
  .build(); // Build the sitemap
