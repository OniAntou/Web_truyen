/**
 * Simple In-Memory Cache with TTL (Time To Live)
 * Used to reduce database load and speed up API responses for Vercel Serverless.
 */

class Cache {
    constructor() {
        this.cache = new Map();
        // Default TTL: 5 minutes (300,000 ms)
        this.defaultTTL = 5 * 60 * 1000;
    }

    /**
     * Set a value in cache
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttl - Milliseconds
     */
    set(key, value, ttl = this.defaultTTL) {
        const expiresAt = Date.now() + ttl;
        this.cache.set(key, { value, expiresAt });
    }

    /**
     * Get a value from cache
     * @param {string} key 
     * @returns {any|null}
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Clear specific or all cache
     */
    flush(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
}

// Export as Singleton
const apiCache = new Cache();
module.exports = apiCache;
