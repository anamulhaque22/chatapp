import { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const toError = (err: unknown): Error => (err instanceof Error ? err : new Error(String(err)));

const forwardError = (nextFn: ErrorForwarder, error: unknown) => {
  nextFn(toError(error));
};
type ErrorForwarder = (error: Error) => void;

export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    void handler(req, res, next).catch((error) => forwardError(next as ErrorForwarder, error));
  };
};
