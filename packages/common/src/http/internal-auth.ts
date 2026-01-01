import { RequestHandler } from 'express';
import { HttpError } from '../erros/http-error';

export interface InternalAuthOptions {
  headerName?: string;
  exemptPaths?: string[];
}

const DEFAULT_HEADER_NAME = 'x-internal-auth-token';

export const createInternalAuthMiddleware = (
  expectedToken: string,
  options: InternalAuthOptions = {},
): RequestHandler => {
  const headerName = options.headerName || DEFAULT_HEADER_NAME;
  const exemptPaths = new Set(options.exemptPaths || []);

  return (req, _res, next) => {
    if (exemptPaths.has(req.path)) {
      return next();
    }

    const provided = req.header(headerName);
    const token = Array.isArray(provided) ? provided[0] : provided;

    if (typeof token !== 'string' || token !== expectedToken) {
      next(new HttpError(401, 'Unauthorized'));
      return;
    }
    next();
  };
};
