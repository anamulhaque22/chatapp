import { z } from '@chatapp/common';

export const conversationIdParamsSchema = z.object({
  conversationId: z.uuid(),
});
