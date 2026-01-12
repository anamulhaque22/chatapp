import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { AUTH_EVENT_EXCHANGE } from '@chatapp/common';
import { Channel, connect, type ChannelModel } from 'amqplib';
let connectionRef: ChannelModel | null = null;
let channel: Channel | null = null;

export const initPublisher = async () => {
  if (!env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL is not defined, event publisher will not be initialized');
    return;
  }
  if (channel) return;

  const connection = await connect(env.RABBITMQ_URL);
  connectionRef = connection;
  channel = await connection.createChannel();

  await channel.assertExchange(AUTH_EVENT_EXCHANGE, 'topic', { durable: true });

  connection.on('close', () => {
    logger.warn('RabbitMQ connection closed');
    channel = null;
    connectionRef = null;
  });

  connection.on('error', (err) => {
    logger.error('RabbitMQ connection error', err);
    channel = null;
    connectionRef = null;
  });

  logger.info('Auth service event publisher initialized');
};
