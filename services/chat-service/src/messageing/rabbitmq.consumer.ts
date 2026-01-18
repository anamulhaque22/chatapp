import { env } from '@/config/env';
import { UserRepository } from '@/repositories/user.repository';
import { UserService } from '@/services/user.service';
import { logger } from '@/utils/logger';
import { USER_CREATED_ROUTING_KEY, USER_EVENTS_EXCHANGE, UserCreatedEvent } from '@chatapp/common';
import { Channel, ChannelModel, connect, ConsumeMessage, Replies } from 'amqplib';

let connectionRef: ChannelModel | null = null;
let channel: Channel | null = null;
let consumerTag: string | null = null;

const EVENT_QUEUE = 'chat-service.user-events';

const closeAmqpConnection = async (conn: ChannelModel) => {
  await conn.close();
};
const userService = new UserService(new UserRepository());

const handleUserCreated = async (event: UserCreatedEvent) => {
  await userService.createUser(event.payload);
};

export const startConsumers = async () => {
  if (!env.RABBITMQ_URI) {
    logger.warn('RABBITMQ_URI is not defined. Skipping RabbitMQ consumer setup.');
    return;
  }

  const conn = await connect(env.RABBITMQ_URI);
  connectionRef = conn;
  channel = await conn.createChannel();

  channel.assertExchange(USER_EVENTS_EXCHANGE, 'topic', { durable: true });
  const q = await channel.assertQueue(EVENT_QUEUE, { durable: true });

  await channel.bindQueue(q.queue, USER_EVENTS_EXCHANGE, USER_CREATED_ROUTING_KEY);

  const consumeHandler = (message: ConsumeMessage | null) => {
    if (!message) return;

    (async () => {
      const payload = JSON.parse(message.content.toString()) as UserCreatedEvent;
      await handleUserCreated(payload);
      channel!.ack(message);
    })().catch((error) => {
      logger.error({ error, message: message.content.toString() }, 'Error processing message');
      channel!.nack(message, false, false);
    });
  };

  const result: Replies.Consume = await channel.consume(q.queue, consumeHandler);
  consumerTag = result.consumerTag;
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
