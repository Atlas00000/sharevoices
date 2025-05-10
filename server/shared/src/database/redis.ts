import { createClient, RedisClientType } from 'redis';
import logger from '../logger';

let client: RedisClientType;

export async function connectRedis(url: string): Promise<RedisClientType> {
  try {
    client = createClient({ url });
    client.on('error', (err) => logger.error('Redis Client Error', err));
    await client.connect();
    logger.info('Connected to Redis');
    return client;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (client) {
      await client.disconnect();
      logger.info('Disconnected from Redis');
    }
  } catch (error) {
    logger.error('Redis disconnection error:', error);
    throw error;
  }
}

process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
}); 