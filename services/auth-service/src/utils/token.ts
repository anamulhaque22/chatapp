import { env } from '@/config/env';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const ACCESS_TOKEN: Secret = env.JWT_ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN: Secret = env.JWT_REFRESH_TOKEN_SECRET;
const ACCESS_OPTIONS: SignOptions = {
  expiresIn: env.JWT_ACCESS_TOKEN_EXPIRATION,
};
const REFRESH_OPTIONS: SignOptions = {
  expiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION,
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN, ACCESS_OPTIONS);
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN, REFRESH_OPTIONS);
};

export const verityRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_TOKEN) as RefreshTokenPayload;
};
