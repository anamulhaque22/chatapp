import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import Redis from 'ioredis';

let redis: Redis | null = null;
const getRedisClient = (): Redis => {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
    });

    redis.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redis.on('error', (error) => {
      logger.error({ err: error }, 'Redis connection error');
    });

    redis.on('close', () => {
      logger.info('Disconnected from Redis');
    });

    redis.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });
  }
  return redis;
};

export const connectRedis = async (): Promise<Redis> => {
  const client = getRedisClient();
  if (client.status === 'ready' || client.status === 'connecting') return;

  await client.connect();
};

export const closeRedis = async () => {
  if (!redis) return;
  await redis.quit();
};
