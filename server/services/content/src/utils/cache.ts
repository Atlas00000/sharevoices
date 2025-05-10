import { logger } from './logger';
import { connectRedis } from '@sharedvoices/shared/src/database/redis';

// Initialize Redis client
const redisClient = connectRedis(process.env.REDIS_URL || 'redis://localhost:6379');

export class Cache {
    private static instance: Cache;
    private readonly defaultTTL = 3600; // 1 hour in seconds

    private constructor() {}

    static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const client = await redisClient;
            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    }

    async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
        try {
            const client = await redisClient;
            await client.set(key, JSON.stringify(value), { EX: ttl });
        } catch (error) {
            logger.error('Cache set error:', error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            const client = await redisClient;
            await client.del(key);
        } catch (error) {
            logger.error('Cache delete error:', error);
        }
    }

    async invalidatePattern(pattern: string): Promise<void> {
        try {
            const client = await redisClient;
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
        } catch (error) {
            logger.error('Cache pattern invalidation error:', error);
        }
    }

    // Cache key generators
    static getArticleKey(id: string): string {
        return `article:${id}`;
    }

    static getArticleListKey(params: any): string {
        const { page, limit, category, status, authorId, search } = params;
        return `articles:${page}:${limit}:${category}:${status}:${authorId}:${search}`;
    }

    static getArticleStatsKey(id: string): string {
        return `article:stats:${id}`;
    }

    static getGlobalStatsKey(): string {
        return 'global:stats';
    }
}

export const cache = Cache.getInstance();