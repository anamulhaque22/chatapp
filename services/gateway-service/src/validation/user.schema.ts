import { z } from '@chatapp/common';

export const createUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(50),
});

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const excludeIdsQuerySchema = z.union([
  z.array(z.string().uuid()),
  z
    .string()
    .uuid()
    .transform((val) => val ?? [val]),
]);

export const searchUsersQuerySchema = z.object({
  query: z.string().min(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (Number.isInteger(val) && val > 0 && val <= 25), {
      message: 'Limit must be a positive integer and at most 25',
    })
    .optional(),
  exclude: excludeIdsQuerySchema,
});

export type SearchUsersQuery = z.infer<typeof searchUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
