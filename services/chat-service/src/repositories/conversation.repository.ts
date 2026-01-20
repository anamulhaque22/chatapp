import { getMongoClient } from '@/clients/mongodb.client';
import { Conversation, ConversationFilter, ConversationSummery, CreateConversationInput } from '@/types/conversion';
import { randomUUID } from 'crypto';
import { Document, WithId } from 'mongodb';

const CONVERSATION_COLLECTION = 'conversations';
const MESSAGE_COLLECTION = 'messages';

const toConversation = (doc: WithId<Document>) => ({
  id: String(doc._id),
  title: doc.title ? String(doc.title) : null,
  participantIds: Array.isArray(doc.participantIds) ? (doc.participantIds as string[]) : [],
  createdAt: new Date(doc.createdAt as string | Date | number),
  updatedAt: new Date(doc.updatedAt as string | Date | number),
  lastMessageAt: doc.lastMessageAt ? new Date(doc.lastMessageAt as string | Date | number) : null,
  lastMessagePreview: doc.lastMessagePreview || null,
});

const toConversationSummery = (doc: WithId<Document>): ConversationSummery => toConversation(doc);

export const conversationRepository = {
  async create(input: CreateConversationInput): Promise<Conversation> {
    const client = await getMongoClient();
    const db = client.db();

    const collection = db.collection(CONVERSATION_COLLECTION);

    const now = new Date();
    const document = {
      _id: randomUUID(),
      title: input.title || null,
      participantIds: input.participantIds,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: null,
      lastMessagePreview: null,
    };
    await collection.insertOne(document);

    return toConversation(document as WithId<Document>);
  },
  async findById(id: string): Promise<Conversation | null> {
    const client = await getMongoClient();
    const db = client.db();

    const collection = db.collection(CONVERSATION_COLLECTION);
    const document = await collection.findOne({ _id: id });

    if (!document) {
      return null;
    }

    return toConversation(document as WithId<Document>);
  },

  async findSummeries(filter: ConversationFilter): Promise<ConversationSummery[]> {
    const client = await getMongoClient();
    const db = client.db();

    const cursor = db
      .collection(CONVERSATION_COLLECTION)
      .find({
        participantIds: filter.participantId,
      })
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    const documents = await cursor.toArray();

    return documents.map((doc) => toConversationSummery(doc as WithId<Document>));
  },

  async touchConversation(conversationId: string, preview: string): Promise<void> {
    const client = await getMongoClient();
    const db = client.db();
    await db.collection(CONVERSATION_COLLECTION).updateOne(
      { _id: conversationId as unknown as ObjectId },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
          updatedAt: new Date(),
        },
      }
    );
  },

  async removeAll(): Promise<void> {
    const client = await getMongoClient();
    const db = client.db();
    await Promise.all([db.collection(CONVERSATIONS_COLLECTION).deleteMany({}), db.collection(MESSAGES_COLLECTION).deleteMany({})]);
  },
};
