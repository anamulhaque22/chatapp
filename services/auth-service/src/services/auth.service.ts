import { sequelize } from '@/db/sequelize';
import { RefreshToken, UserCredentials } from '@/models';
import { AuthResponse, type AuthTokens, type LoginInput, RegisterInput } from '@/types/auth';
import { logger } from '@/utils/logger';
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verityRefreshToken,
} from '@/utils/token';
import { HttpError } from '@chatapp/common';
import { Transaction } from 'sequelize';
import { publishedUserRegistered } from './../messaging/event-publisher';

const REFRESH_TOKEN_TTL_DAYS = 7;

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const existing = await UserCredentials.findOne({
    where: { email: input.email },
  });

  if (existing) {
    throw new HttpError(409, 'Email already in use');
  }

  const transaction = await sequelize.transaction();
  try {
    const passwordHash = await hashPassword(input.password);
    const user = await UserCredentials.create(
      {
        email: input.email,
        passwordHash,
        displayName: input.displayName,
      },
      { transaction },
    );

    const refreshTokenRecord = await createRefreshToken(user.id, transaction);

    await transaction.commit();

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = signRefreshToken({
      sub: user.id,
      tokenId: refreshTokenRecord.tokenId,
    });

    const userData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };

    console.log('publishing user registered event', userData);

    publishedUserRegistered(userData);

    return {
      accessToken,
      refreshToken,
      user: userData,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const login = async (input: LoginInput): Promise<AuthTokens> => {
  const user = await UserCredentials.findOne({
    where: { email: input.email },
  });

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid email or password');
  }
  const refreshTokenRecord = await createRefreshToken(user.id);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: refreshTokenRecord.tokenId,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const refreshTokens = async (token: string): Promise<AuthTokens> => {
  const verifiedRefreshToken = verityRefreshToken(token);
  const tokenRecord = await RefreshToken.findOne({
    where: {
      userId: verifiedRefreshToken.sub,
      tokenId: verifiedRefreshToken.tokenId,
    },
  });

  if (!tokenRecord) {
    throw new HttpError(401, 'Invalid refresh token');
  }

  if (tokenRecord.expiresAt.getTime() < Date.now()) {
    await tokenRecord.destroy();
    throw new HttpError(401, 'Refresh token expired');
  }
  const user = await UserCredentials.findByPk(verifiedRefreshToken.sub);

  if (!user) {
    logger.warn(`User not found for refresh token: ${verifiedRefreshToken.sub}`);
    throw new HttpError(401, 'User not found');
  }
  await tokenRecord.destroy();

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
  });
  const refreshTokenRecord = await createRefreshToken(user.id);
  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: refreshTokenRecord.tokenId,
  });
  return {
    accessToken,
    refreshToken,
  };
};

export const revokeRefreshToken = (userId: string) => {
  return RefreshToken.destroy({
    where: { userId },
  });
};
const createRefreshToken = async (userId: string, transaction?: Transaction) => {
  const expireAt = new Date();
  expireAt.setDate(expireAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  const tokenId = crypto.randomUUID();

  const record = await RefreshToken.create(
    {
      userId,
      tokenId,
      expiresAt: expireAt,
    },
    { transaction },
  );
  return record;
};
