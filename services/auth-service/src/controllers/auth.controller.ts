import { register } from '@/services/auth.service';
import { RegisterInput } from '@/types/auth';
import { asyncHandler } from '@chatapp/common';
import { RequestHandler } from 'express';

export const registerHandler: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as RegisterInput;
  const token = await register(payload);
  res.status(201).json(token);
});
