import { registerHandler } from '@/controllers/auth.controller';
import { validateRequest } from '@chatapp/common';
import { Router } from 'express';
import { registerSchema } from './auth.schema';

export const authRoute: Router = Router();

authRoute.post(
  '/register',
  validateRequest({
    body: registerSchema.shape.body,
  }),
  registerHandler,
);
