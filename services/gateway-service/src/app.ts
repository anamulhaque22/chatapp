import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';

export const createApp = (): Application => {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((_req, res) => {
    res.status(200).json({ message: 'Not Found' });
  });

  return app;
};
