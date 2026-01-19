import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { USER_CREATED_ROUTING_KEY, USER_EVENTS_EXCHANGE, UserCreatedEvent, UserCreatedPayload } from '@chatapp/common';
import { Channel, ChannelModel, connect, Connection } from 'amqplib';

type ManageConnection = Connection & Pick<ChannelModel, 'createChannel' | 'close'>;

let connection: ManageConnection | null = null;
let channel: Channel | null = null;

const messageEnabled = Boolean(env.RABBITMQ_URL);

const ensureChannel = async (): Promise<Channel | null> => {
  if (!messageEnabled) return null;
  if (channel) return channel;
  if (!env.RABBITMQ_URL) return null;

  const conn = (await connect(env.RABBITMQ_URL)) as unknown as ManageConnection;
  connection = conn;

  conn.on('error', (err) => {
    console.error('RabbitMQ connection error:', err);
    connection = null;
    channel = null;
  });

  conn.on('close', () => {
    console.warn('RabbitMQ connection closed');
    connection = null;
    channel = null;
  });

  const amqpChannel = await conn.createChannel();
  channel = amqpChannel;
  amqpChannel.assertExchange(USER_EVENTS_EXCHANGE, 'topic', { durable: true });
  return amqpChannel;
};

export const initMessaging = async (): Promise<void> => {
  if (!messageEnabled) {
    logger.warn('Messaging is disabled. RABBITMQ_URL is not set.');
    return;
  }
  await ensureChannel();
  logger.info('Messaging initialized and connected to RabbitMQ.');
};

export const closeMessaging = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  } catch (error) {
    logger.error('Error closing messaging connection:', error);
  }
};

export const publishUserCreatedEvent = async (payload: UserCreatedPayload) => {
  const chan = await ensureChannel();
  if (!chan) {
    logger.warn('Cannot publish event, messaging channel is not available.');
    return;
  }

  const event: UserCreatedEvent = {
    type: USER_CREATED_ROUTING_KEY,
    payload,
    occurredAt: new Date().toISOString(),
    metadata: { version: 1, service: env.SERVICE_NAME || 'user-service' },
  };

  try {
    const published = chan.publish(USER_EVENTS_EXCHANGE, USER_CREATED_ROUTING_KEY, Buffer.from(JSON.stringify(event)), { persistent: true });
    if (!published) {
      logger.warn('UserCreatedEvent was not published successfully.');
    }
  } catch (error) {
    logger.error({ err: error }, 'Error publishing UserCreatedEvent:');
  }
};
