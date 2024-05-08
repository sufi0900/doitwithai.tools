// lib/sanity.js
import client from '@sanity/client';

export const client = sanityClient({
    projectId: 'gglvlxzt', // Replace with your project ID
    dataset: 'production',
    useCdn: true,
    apiVersion: '2024-03-25' // use a date at or before the current date
});

export const fetchUrls = async () => {
    const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]]{_type, slug}`;
    const posts = await client.fetch(query);
    return posts.map(post => ({
        type: post._type,
        slug: post.slug.current
    }));
};
