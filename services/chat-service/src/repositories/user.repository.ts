import { getMongoClient } from '@/clients/mongodb.client';
import { Nullable } from '@/utils/types/nullable.type';
import { UserCreatedPayload } from '@chatapp/common';
import { Collection } from 'mongodb';

const COLLECTION_NAME = 'users';

interface UserDocument {
  _id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

const getCollection = async (): Promise<Collection<UserDocument>> => {
  const client = await getMongoClient();
  return client.db().collection<UserDocument>(COLLECTION_NAME);
};

export interface IUserRepository {
  upsertUser(user: UserCreatedPayload): Promise<void>;
  getUserById(id: string): Promise<Nullable<UserDocument>>;
}

export class UserRepository implements IUserRepository {
  async upsertUser(user: UserCreatedPayload): Promise<void> {
    const collection = await getCollection();
    await collection.updateOne(
      {
        _id: user.id,
      },
      {
        $set: {
          _id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      {
        upsert: true,
      }
    );
  }

  async getUserById(id: string): Promise<Nullable<UserDocument>> {
    const collection = await getCollection();
    const user = await collection.findOne({ _id: id });
    return user;
  }
}
