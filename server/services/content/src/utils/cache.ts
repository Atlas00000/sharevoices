import Redis from 'ioredis';
import { logger } from './logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
});

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
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    }

    async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
        try {
            await redis.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (error) {
            logger.error('Cache set error:', error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            logger.error('Cache delete error:', error);
        }
    }

    async invalidatePattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
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