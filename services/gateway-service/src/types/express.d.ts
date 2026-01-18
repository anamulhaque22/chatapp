import { AuthenticatedUser } from '@chatapp/common';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
