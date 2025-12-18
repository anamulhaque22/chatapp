import { env } from '@/config/env';
import { createServer } from 'http';
import { createApp } from './app';
import { connectToDatabase } from './db/sequelize';
import { logger } from './utils/logger';

const main = async () => {
  try {
    await connectToDatabase();

    const app = createApp();
    const server = createServer(app);

    const port = env.AUTH_SERVICE_PORT;

    server.listen(port, () => {
      logger.info({ port }, 'Auth service is running');
    });
    const shutdown = () => {
      logger.info('Shutting down auth service...');
      Promise.all([])
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
    logger.error({ error }, 'Failed to start auth service');
    process.exit(1);
  }
};
void main();
