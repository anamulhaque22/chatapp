import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(env.USER_DB_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug({ sequelize: msg }) : false,
  define: {
    underscored: true,
    freezeTableName: true,
  },
});

export const connectToDatabase = async () => {
  await sequelize.authenticate();
  logger.info('Connected to the User database successfully.');
};

export const initilizeDatabase = async () => {
  await connectToDatabase();
};

export const closeDatabaseConnection = async () => {
  await sequelize.close();
  logger.info('User database connection closed.');
};
