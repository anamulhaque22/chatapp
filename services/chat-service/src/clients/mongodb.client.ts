import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (client) {
    return client;
  }

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  logger.info('Connected to MongoDB');
  return client;
};

export const closeMongoClient = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    logger.info('Disconnected from MongoDB');
  }
};
