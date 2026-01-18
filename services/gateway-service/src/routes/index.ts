import { Router } from 'express';
import { authRouter } from './auth.route';

export const registerRoute = (app: Router) => {
  app.use('/auth', authRouter);
  app.use('/users', userRouter);
};
