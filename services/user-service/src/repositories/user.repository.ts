import { UserModel } from '@/db';
import type { User } from '@/types/user';
import { AuthUserRegisteredPayload } from '@chatapp/common';

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
