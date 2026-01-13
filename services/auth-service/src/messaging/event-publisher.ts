import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import {
  AUTH_EVENT_EXCHANGE,
  AUTH_USER_REGISTERED_ROUTING_KEY,
  AuthUserRegisteredPayload,
} from '@chatapp/common';
import { Channel, connect, type ChannelModel } from 'amqplib';
let connectionRef: ChannelModel | null = null;
let channel: Channel | null = null;

export const initPublisher = async () => {
  if (!env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL is not defined, event publisher will not be initialized');
    return;
  }
  if (channel) return;
  console.log('Connecting to RabbitMQ at', env.RABBITMQ_URL);
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

export const publishedUserRegistered = (payload: AuthUserRegisteredPayload) => {
  if (!channel) {
    logger.warn('RabbitMQ channel is not initialized, cannot publish user registered event');
    return;
  }
  const event = {
    type: AUTH_USER_REGISTERED_ROUTING_KEY,
    payload,
    occuredAt: new Date().toISOString(),
    metadata: { version: 1 },
  };
  const published = channel.publish(
    AUTH_EVENT_EXCHANGE,
    AUTH_USER_REGISTERED_ROUTING_KEY,
    Buffer.from(JSON.stringify(event)),
    { persistent: true, contentType: 'application/json' },
  );
  if (!published) {
    logger.warn({ event }, 'Failed to publish user registered event');
  }
};

export const closePublisher = async () => {
  try {
    await channel?.close();
    await connectionRef?.close();
    channel = null;
    connectionRef = null;
    logger.info('Auth service event publisher closed');
  } catch (error) {
    logger.error('Error closing auth service event publisher', error);
  }
};
