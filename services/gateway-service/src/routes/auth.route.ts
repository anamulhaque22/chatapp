import {
  login,
  refreshToken,
  registerUser,
  revokeRefreshToken,
} from '@/controllers/auth.controller';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  revokeSchema,
} from '@/validation/auth.schema';
import { asyncHandler, validateRequest } from '@chatapp/common';
import { Router } from 'express';

export const authRouter: Router = Router();
authRouter.post('/register', validateRequest({ body: registerSchema }), asyncHandler(registerUser));
authRouter.post('/login', validateRequest({ body: loginSchema }), asyncHandler(login));
authRouter.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema }),
  asyncHandler(refreshToken),
);
authRouter.post(
  '/revoke-refresh-token',
  validateRequest({ body: revokeSchema }),
  asyncHandler(revokeRefreshToken),
);
