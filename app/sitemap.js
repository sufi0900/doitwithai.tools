// Import the fetchURLs function from your lib/sanity file
import { fetchURLs } from '../app/lib/sanity';

// Define the base URL of your website
const baseURL = 'https://www.doitwithai.tools/';

// Function to generate the sitemap
export default async function sitemap() {
    try {
        // Fetch all posts from Sanity.io
        const posts = await fetchURLs();

        // Map the fetched posts to the sitemap format
        const sitemapEntries = posts.map(post => ({
            url: `${baseURL}/${post._type}/${post.slug}`,
            lastModified: new Date(), // You can set this to the last modified date of the post
            changeFrequency: 'weekly', // Adjust this according to your preference
            priority: 0.5, // Adjust this according to your preference
            title: post.title || '', // Add the title field or default to an empty string
        }));

        // Add other static routes
        const staticRoutes = [
            {
                url: `${baseURL}/all-posts`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
                title: 'All Posts', // Example heading for the static page
            },
            // Add more static routes here
        ];

        // Combine the dynamic and static entries
        const sitemapEntriesWithStatic = [...sitemapEntries, ...staticRoutes].map(entry => ({
            ...entry,
            title: entry.title || '', // Ensure a default empty string if title is missing
        }));
        
        // Return the sitemap entries
        return sitemapEntriesWithStatic;
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return sitemapEntriesWithStatic;
    }
}