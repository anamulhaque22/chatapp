import { publishUserCreatedEvent } from '@/messaging/event-publisher';
import { userRepository, UserRepository } from '@/repositories/user.repository';
import type { CreateUserInput, User } from '@/types/user';
import { AuthUserRegisteredPayload, HttpError } from '@chatapp/common';
import { UniqueConstraintError } from 'sequelize';

class UserService {
  constructor(private repository: UserRepository) {}

  async createUser(user: CreateUserInput): Promise<User> {
    try {
      const newUser = await this.repository.create(user);

      void publishUserCreatedEvent({
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        createdAt: newUser.createdAt.toISOString(),
      });
      return newUser;
    } catch (error) {
      if (error instanceof UniqueConstraintError)
        throw new HttpError(409, 'User with this email already exists');

      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new HttpError(404, 'User not found');
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.repository.findAll();
  }

  async searchUsers(params: {
    query: string;
    options?: { limit?: number; excludeIds?: string[] };
  }): Promise<User[]> {
    return this.repository.searchQuery(params.query, params.options);
  }

  async syncFromAuthUser(payload: AuthUserRegisteredPayload): Promise<User> {
    console.log('user service', payload);
    const user = await this.repository.upsertFromAuthEvent(payload);

    void publishUserCreatedEvent({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    });

    return user;
  }
}

export const userService = new UserService(userRepository);
