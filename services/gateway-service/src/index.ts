import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const main = async () => {
  try {
    const app = createApp();
    const server = createServer(app);
    const port = env.GATEWAY_PORT;

    server.listen(port, () => {
      logger.info({ port }, 'Gateway service is running');
    });

    const shutdown = () => {
      logger.info('Shutting down gateway service...');
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
    console.log(error);
    logger.error({ error }, 'Failed to start gateway service');
    process.exit(1);
  }
};
void main();
