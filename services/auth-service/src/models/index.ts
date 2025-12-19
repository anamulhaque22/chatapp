import { sequelize } from '@/db/sequelize';
import { RefreshToken } from './refresh-token.model';
import { UserCredentials } from './user-credentials.model';
export const initModels = async () => {
  await sequelize.sync();
};

export { RefreshToken, UserCredentials };
