import { userRepository, UserRepository } from '@/repositories/user.repository';
import type { User } from '@/types/user';
import { AuthUserRegisteredPayload } from '@chatapp/common';

class UserService {
  constructor(private repository: UserRepository) {}

  async syncFromAuthUser(payload: AuthUserRegisteredPayload): Promise<User> {
    console.log('user service', payload);
    const user = await this.repository.upsertFromAuthEvent(payload);

    return user;
  }
}

export const userService = new UserService(userRepository);
