import { userService } from '@/services/user.service';
import { CreateUserInput, SearchUsersQuery, UserIdParams } from '@/validation/user.schema';
import { AsyncHandler } from '@chatapp/common';

export const getUser: AsyncHandler = async (req, res, next) => {
  try {
    const { id } = req.params as unknown as UserIdParams;
    const user = await userService.getUserById(id);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers: AsyncHandler = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = req.body as CreateUserInput;
    const user = await userService.createUser(payload);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const searchUsers: AsyncHandler = async (req, res, next) => {
  try {
    const { exclude, query, limit } = req.query as unknown as SearchUsersQuery;
    const users = await userService.searchUsers({
      query,
      options: {
        limit,
        excludeIds: exclude,
      },
    });
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};
