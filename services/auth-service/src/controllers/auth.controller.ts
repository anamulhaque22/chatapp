import { login, refreshTokens, register, revokeRefreshToken } from '@/services/auth.service';
import { LoginInput, RegisterInput } from '@/types/auth';
import { asyncHandler, HttpError } from '@chatapp/common';
import { RequestHandler } from 'express';

export const registerHandler: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as RegisterInput;
  const token = await register(payload);
  res.status(201).json(token);
});

export const loginHandler: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as LoginInput;
  const token = await login(payload);
  res.status(200).json(token);
});

export const refreshTokenHandler: RequestHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    throw new HttpError(400, 'Refresh token is required');
  }
  const token = await refreshTokens(refreshToken);
  res.status(200).json(token);
});

export const revokeRefreshTokenHandler: RequestHandler = asyncHandler(async (req, res) => {
  const { userId } = req.body as { userId: string };
  if (!userId) {
    throw new HttpError(400, 'User ID is required');
  }

  await revokeRefreshToken(userId);
  res.status(204).send();
});
