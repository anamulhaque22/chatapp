import { conversationCache } from '@/cache/conversation.cash';
import { conversationRepository } from '@/repositories/conversation.repository';
import { Conversation, ConversationFilter, ConversationSummery, CreateConversationInput } from '@/types/conversion';
import { HttpError } from '@chatapp/common';

export const conversationService = {
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const conversation = await conversationRepository.create(input);
    return conversation;
  },

  async getConversationById(id: string): Promise<Conversation | null> {
    const cachedConversation = await conversationCache.get(id);
    if (cachedConversation) {
      return cachedConversation;
    }

    const conversation = await conversationRepository.findById(id);
    if (!conversation) {
      throw new HttpError(404, 'Conversation not found');
    }

    await conversationCache.set(conversation);
    return conversation;
  },

  async listConversation(filter: ConversationFilter): Promise<ConversationSummery> {
    const conversations = await conversationRepository.findSummeries(filter);
  },

  async touchConversation(conversationId: string, preview: string): Promise<void> {
    await conversationRepository.touchConversation(conversationId, preview);
    await conversationCache.del(conversationId);
  },
};
