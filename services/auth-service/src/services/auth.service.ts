import { sequelize } from '@/db/sequelize';
import { RefreshToken, UserCredentials } from '@/models';
import { AuthResponse, RegisterInput } from '@/types/auth';
import { hashPassword, signAccessToken, signRefreshToken } from '@/utils/token';
import { HttpError } from '@chatapp/common';
import { Transaction } from 'sequelize';

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
