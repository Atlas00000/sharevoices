import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;

export async function connectRedis(url: string) {
  if (!client) {
    client = createClient({ url });
    client.on('error', err => console.error('Redis Client Error', err));
    await client.connect();
    console.log('Connected to Redis');
  }
  return client;
}

export function getRedisClient() {
  if (!client) throw new Error('Redis client not initialized. Call connectRedis first.');
  return client;
} 