import { createServer } from 'http';
import { createApp } from './app';
import { closeMongoClient, getMongoClient } from './clients/mongodb.client';
import { closeRedis, connectRedis } from './clients/redis.client';
import { env } from './config/env';
import { startConsumers } from './messageing/rabbitmq.consumer';
import { logger } from './utils/logger';

const main = async () => {
  try {
    await Promise.all([getMongoClient(), connectRedis()], startConsumers());
    const app = createApp();
    const server = createServer(app);
    const port = env.CHAT_SERVICE_PORT;

    server.listen(port, () => {
      logger.info({ port }, 'Chat service is running');
    });

    const shutdown = () => {
      logger.info('Shutting down chat service...');
      Promise.all([closeRedis(), closeMongoClient()])
        .catch((error: unknown) => {
          logger.error({ error }, 'Error during shutdown');
        })
        .finally(() => {
          server.close(() => process.exit(0));
        });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.log(error);
    logger.error({ error }, 'Failed to start chat service');
    process.exit(1);
  }
};
void main();
