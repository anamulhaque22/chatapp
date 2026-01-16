import { authProxyService } from '@/services/auth-proxy.service';
import { logger } from '@/utils/logger';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  revokeSchema,
} from '@/validation/auth.schema';
import { AsyncHandler } from '@chatapp/common';

export const registerUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const response = await authProxyService.register(payload);
    res.status(201).json(response);
  } catch (error) {
    logger.error({ error }, 'Failed to register user');
    next(error);
  }
};

export const login: AsyncHandler = async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const response = await authProxyService.login(payload);
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Failed to login user');
    next(error);
  }
};

export const refreshToken: AsyncHandler = async (req, res, next) => {
  try {
    const payload = refreshTokenSchema.parse(req.body);
    const response = await authProxyService.refreshToken(payload);
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Failed to refresh token');
    next(error);
  }
};

export const revokeRefreshToken: AsyncHandler = async (req, res, next) => {
  try {
    const { userId } = revokeSchema.parse(req.body);
    await authProxyService.revokeRefreshToken({ userId });
    res.status(204).send();
  } catch (error) {
    logger.error({ error }, 'Failed to revoke refresh token');
    next(error);
  }
};
