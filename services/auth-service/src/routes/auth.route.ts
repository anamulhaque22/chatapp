import { registerHandler } from '@/controllers/auth.controller';
import { validateRequest } from '@chatapp/common';
import { Router } from 'express';

export const authRoute: Router = Router();

authRoute.post('/register', validateRequest({}), registerHandler);
