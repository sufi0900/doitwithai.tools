"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { client } from "@/sanity/lib/client";

const TagPage = () => {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    
    useEffect(() => {
        if (!router.isReady) return; // Ensure router is ready
        const tag = router.query.tag; // Retrieve tag safely after router is ready

        async function fetchData() {
            const query = `*[_type == "aitool" && $tag in tags]`;
            const fetchedPosts = await client.fetch(query, { tag });
            setPosts(fetchedPosts);
        }

        fetchData();
    }, [router.isReady, router.query?.tag]); // Now Depend on both router readiness and tag changes

    return (
        <div>
            <h1>Posts tagged: {router.query?.tag}</h1>
            {posts.map(post => (
                <div key={post._id}>
                    <h2>{post.title}</h2>
                </div>
            ))}
        </div>
    );
};

export default TagPage;
