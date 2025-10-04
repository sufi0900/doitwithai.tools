// sitemap.js - FIXED VERSION
import { fetchURLs } from '../app/lib/sanity';

const baseURL = 'https://doitwithai.tools';

// Define the correct URL mapping for your schema types
const SCHEMA_TYPE_TO_URL_PREFIX = {
    'makemoney': 'ai-learn-earn',
    'aitool': 'ai-tools', 
    'coding': 'ai-code',
    'seo': 'ai-seo',
    'freeResources': 'free-ai-resource' 
};

export default async function sitemap() {
    try {
        // Fetch all posts from Sanity.io
        const posts = await fetchURLs();

        // Map the fetched posts to the sitemap format with correct URL prefixes
        const sitemapEntries = posts.map(post => {
            const urlPrefix = SCHEMA_TYPE_TO_URL_PREFIX[post._type] || post._type;
            
            return {
                url: `${baseURL}/${urlPrefix}/${post.slug}`,
                lastModified: new Date(post._updatedAt || Date.now()),
                changeFrequency: 'weekly',
                priority: 0.7,
            };
        });

        // Add all your static routes (THIS WAS MISSING!)
        const staticRoutes = [
            // Homepage
            {
                url: baseURL,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            // Main category pages
            {
                url: `${baseURL}/ai-tools`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${baseURL}/ai-seo`,
                lastModified: new Date(),
                changeFrequency: 'daily', 
                priority: 0.9,
            },
            {
                url: `${baseURL}/ai-code`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${baseURL}/ai-learn-earn`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${baseURL}/free-ai-resource`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            },
            {
                url: `${baseURL}/blogs`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.8,
            },
            // Other important pages
            {
                url: `${baseURL}/about`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
            {
                url: `${baseURL}/contact`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
            {
                url: `${baseURL}/blogs`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            },
            // Newly added static pages
            {
                url: `${baseURL}/navigation`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
            {
                url: `${baseURL}/author/sufian-mustafa`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
            {
                url: `${baseURL}/faq`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
            {
                url: `${baseURL}/categories`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            },
        ];

        // Combine dynamic and static entries
        const allEntries = [...sitemapEntries, ...staticRoutes];
        
        // Remove duplicates and sort by priority
        const uniqueEntries = allEntries.filter((entry, index, self) => 
            index === self.findIndex(e => e.url === entry.url)
        );

        return uniqueEntries.sort((a, b) => b.priority - a.priority);
        
    } catch (error) {
        console.error('Error generating sitemap:', error);
        
        // Return at least static routes if dynamic fetch fails
        return [
            {
                url: baseURL,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            }
        ];
    }
}
