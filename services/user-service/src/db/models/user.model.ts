import type { User } from '@/types/user';
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export type UserCreationAttributes = Optional<User, 'id' | 'createdAt' | 'updatedAt'>;

export class UserModel extends Model<UserModel, UserCreationAttributes> {
  declare id: string | null;
  declare email: string;
  declare displayName: string;
  declare createAt: Date | null;
  declare updatedAt: Date | null;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize, tableName: 'users' },
);
