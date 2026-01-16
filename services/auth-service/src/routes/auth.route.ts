import {
  loginHandler,
  refreshTokenHandler,
  registerHandler,
  revokeRefreshTokenHandler,
} from '@/controllers/auth.controller';
import { validateRequest } from '@chatapp/common';
import { Router } from 'express';
import { loginSchema, refreshTokenSchema, registerSchema, revokeSchema } from './auth.schema';

export const authRoute: Router = Router();

authRoute.post('/register', validateRequest({ body: registerSchema.shape.body }), registerHandler);
authRoute.post('/login', validateRequest({ body: loginSchema.shape.body }), loginHandler);
authRoute.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema.shape.body }),
  refreshTokenHandler,
);
authRoute.post(
  '/revoke-refresh-token',
  validateRequest({ body: revokeSchema.shape.body }),
  revokeRefreshTokenHandler,
);
