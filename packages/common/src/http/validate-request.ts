import { Request } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { HttpError } from '../erros/http-error';

type Schema = ZodTypeAny;
type ParamsRecord = Record<string, string>;
type QueryRecord = Record<string, unknown>;

export interface RequestValidationSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}

const formatedError = (error: ZodError) =>
  error.errors.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

export const validateRequest = (schemas: RequestValidationSchemas) => {
  return (req: Request, _res: Response, next: nextFunction) => {
    try {
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body) as unknown;
        req.body = parsedBody;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params as ParamsRecord);
        req.params = parsedParams as Request['params'];
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query as QueryRecord) as QueryRecord;
        req.query = parsedQuery as Request['query'];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new HttpError(400, 'Validation Error', {
            issues: formatedError(error),
          }),
        );
        return;
      }
      next(error);
    }
  };
};
