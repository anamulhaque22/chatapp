import { UserModel } from '@/db';
import type { CreateUserInput, User } from '@/types/user';
import { AuthUserRegisteredPayload } from '@chatapp/common';
import { Op, WhereOptions } from 'sequelize';

export class UserMapper {
  static toDomain(userModel: UserModel) {
    return {
      id: userModel.id!,
      email: userModel.email,
      displayName: userModel.displayName,
      createdAt: userModel.createAt!,
      updatedAt: userModel.updatedAt!,
    };
  }
}

export class UserRepository {
  async findById(id: string): Promise<User> {
    const userModel = await UserModel.findByPk(id);
    return userModel ? UserMapper.toDomain(userModel) : null;
  }

  async findAll(): Promise<User[]> {
    const userModels = await UserModel.findAll({
      order: [['displayName', 'ASC']],
    });

    return userModels.map(UserMapper.toDomain);
  }

  async create(user: CreateUserInput): Promise<User> {
    const userModel = await UserModel.create(user);
    return UserMapper.toDomain(userModel);
  }

  async searchQuery(
    query: string,
    options: { limit?: number; excludeIds?: string[] } = {},
  ): Promise<User[]> {
    const whereClause: WhereOptions = {
      [Op.or]: [
        { displayName: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
      ],
    };
    if (options.excludeIds && options.excludeIds.length > 0) {
      Object.assign(whereClause, {
        id: { [Op.notIn]: options.excludeIds },
      });
    }

    const userModels = await UserModel.findAll({
      where: whereClause,
      limit: options.limit,
      order: [['displayName', 'ASC']],
    });

    return userModels.map(UserMapper.toDomain);
  }

  async upsertFromAuthEvent(payload: AuthUserRegisteredPayload): Promise<User> {
    const [userModel] = await UserModel.upsert(
      {
        id: payload.id,
        email: payload.email,
        displayName: payload.displayName,
      },
      { returning: true },
    );
    return UserMapper.toDomain(userModel);
  }
}

export const userRepository = new UserRepository();
