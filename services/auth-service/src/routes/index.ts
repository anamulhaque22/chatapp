import { Router } from 'express';
import { authRoute } from './auth.route';

export const registerRoutes = (app: Router) => {
  app.use('/auth', authRoute);
};
