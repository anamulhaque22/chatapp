import { env } from '@/config/env';
import { userService } from '@/services/user.service';
import { logger } from '@/utils/logger';
import { AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTERED_ROUTING_KEY, type AuthRegisteredEvent } from '@chatapp/common';
import { Channel, ChannelModel, connect, Connection, ConsumeMessage, Replies } from 'amqplib';

type ManageConnection = Connection & ChannelModel;

let connectionRef: ManageConnection | null = null;
let channel: Channel | null = null;
let consumerTag: string | null = null;

const QUEUE_NAME = 'auth-service.auth-events';

const closeConnection = async (conn: ManageConnection) => {
  await conn.close();
  channelRef = null;
  channel = null;
  consumerTag = null;
};

const handleMessage = async (msg: ConsumeMessage, ch: Channel) => {
  const row = msg.content.toString('utf-8');
  const event = JSON.parse(row) as AuthRegisteredEvent;
  await userService.syncFromAuthUser(event.payload);
  logger.info({ event }, 'User service synced user from auth service');
  ch.ack(msg);
};

export const startAuthEventConsumer = async () => {
  if (!env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL is not defined. Skipping auth event consumer setup.');
    return;
  }
  if (channel) return;

  const connection = (await connect(env.RABBITMQ_URL)) as ManageConnection;
  connectionRef = connection;

  channel = await connection.createChannel();

  await channel.assertExchange(AUTH_EVENT_EXCHANGE, 'topic', { durable: true });
  const queue = await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(queue.queue, AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTERED_ROUTING_KEY);

  const ch = channel;
  const consumeHandler = async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    try {
      await handleMessage(msg, ch);
    } catch (error) {
      logger.error({ err: error }, 'Error processing auth event message');
      ch.nack(msg, false, false);
    }
  };

  const result: Replies.Consume = await channel.consume(queue.queue, consumeHandler);
  consumerTag = result.consumerTag;

  connection.on('close', () => {
    logger.warn('User service Auth event consumer connection closed. Cleaning up references.');
    channelRef = null;
    channel = null;
    consumerTag = null;
  });
};

export const stopAuthEventConsumer = async () => {
  try {
    if (channel && consumerTag) {
      await channel.cancel(consumerTag);
      await channel.close();
      if (connectionRef) {
        await closeConnection(connectionRef);
      }
      channelRef = null;
      channel = null;
      consumerTag = null;
    }
  } catch (error) {}
};
