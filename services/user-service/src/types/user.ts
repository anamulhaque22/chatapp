export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {}
