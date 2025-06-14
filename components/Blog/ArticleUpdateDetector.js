// Create new file: components/Blog/ArticleUpdateDetector.js
export class ArticleUpdateDetector {
    static async checkArticleUpdates(documentType, slug, lastCheckTime) {
        try {
            const query = `*[_type == "${documentType}" && slug.current == "${slug}" && _updatedAt > "${new Date(lastCheckTime).toISOString()}"]`;
            const { client } = await import("@/sanity/lib/client");
            const updates = await client.fetch(query);
            return updates.length > 0;
        } catch (error) {
            console.error('Failed to check article updates:', error);
            return false;
        }
    }

    static async startArticlePolling(documentType, slug, callback, interval = 15000) {
        const lastCheckTime = Date.now();
        
        const checkForUpdates = async () => {
            try {
                const hasUpdates = await this.checkArticleUpdates(documentType, slug, lastCheckTime);
                if (hasUpdates) {
                    callback(documentType, slug);
                }
            } catch (error) {
                console.error('Article polling error:', error);
            }
        };

        const intervalId = setInterval(checkForUpdates, interval);
        
        // Return cleanup function
        return () => {
            clearInterval(intervalId);
        };
    }
}