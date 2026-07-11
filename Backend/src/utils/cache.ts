import { Redis } from '@upstash/redis';

// Determine if we should use Redis or fallback to in-memory for local dev
const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
export const isRedisEnabled = useRedis;

const redis = useRedis ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
}) : null;

class Cache {
    cache: Map<string, { value: any, expiresAt: number }>;
    defaultTTL: number;

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
    async set(key: string, value: any, ttl = this.defaultTTL) {
        if (redis) {
            try {
                // Redis expects value in JSON format for objects, but Upstash SDK 
                // stringifies objects automatically and we can just pass the value.
                await redis.set(key, value, { px: ttl });
            } catch (err) {
                console.error('Redis Set Error:', err);
            }
        } else {
            const expiresAt = Date.now() + ttl;
            this.cache.set(key, { value, expiresAt });
        }
    }

    /**
     * Get a value from cache
     * @param {string} key 
     * @returns {any|null}
     */
    async get(key: string): Promise<any> {
        if (redis) {
            try {
                const data = await redis.get(key);
                return data; 
            } catch (err) {
                console.error('Redis Get Error:', err);
                return null;
            }
        } else {
            const entry = this.cache.get(key);
            if (!entry) return null;

            if (Date.now() > entry.expiresAt) {
                this.cache.delete(key);
                return null;
            }

            return entry.value;
        }
    }

    /**
     * Clear specific, by prefix, or all cache
     */
    async flush(pattern: string | null = null) {
        if (redis) {
            try {
                if (!pattern) {
                    await redis.flushdb();
                    return;
                }
                
                // For a pattern prefix like 'homepage'
                let cursor = '0';
                do {
                    const [nextCursor, keys] = await redis.scan(cursor, { match: `${pattern}*`, count: 100 });
                    cursor = nextCursor;
                    if (keys && keys.length > 0) {
                        const pipeline = redis.pipeline();
                        keys.forEach(k => pipeline.del(k));
                        await pipeline.exec();
                    }
                } while (cursor !== '0');
            } catch (err) {
                console.error('Redis Flush Error:', err);
            }
        } else {
            if (!pattern) {
                this.cache.clear();
                return;
            }

            if (this.cache.has(pattern)) {
                this.cache.delete(pattern);
            } else {
                for (const key of this.cache.keys()) {
                    if (key.startsWith(pattern)) {
                        this.cache.delete(key);
                    }
                }
            }
        }
    }
}

// Export as Singleton
const apiCache = new Cache();
export default apiCache;
