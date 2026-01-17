import { getAllUsers } from '@/controllers/user.controller';
import {
  createUserSchema,
  searchUsersQuerySchema,
  userIdParamsSchema,
} from '@/validation/user.schema';
import { asyncHandler, validateRequest } from '@chatapp/common';
import { Router } from 'express';

const userRoutes: Router = Router();

userRoutes.get('/', asyncHandler(getAllUsers));
userRoutes.get('/:id', validateRequest(userIdParamsSchema), asyncHandler(getUser));
userRoutes.post('/', validateRequest(createUserSchema), asyncHandler(createUser));
userRoutes.get('/search', validateRequest(searchUsersQuerySchema), asyncHandler(searchUsers));

export { userRoutes };
