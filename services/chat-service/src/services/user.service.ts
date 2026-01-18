import { UserCreatedPayload } from '@chatapp/common';
import { IUserRepository } from './../repositories/user.repository';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(user: UserCreatedPayload): Promise<void> {
    await this.userRepository.upsertUser(user);
  }
}
