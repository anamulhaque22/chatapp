import { logger } from "@/utils/logger";
import { HttpError } from "@chatapp/common";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error({ err }, "Unhandled error occurred");

  const error = err instanceof HttpError ? err : undefined;
  const statusCode = error ? error.statusCode : 500;
  const message =
    statusCode >= 500
      ? "Internal Server Error"
      : (error?.message ?? "Unknown Error");

  const payload = error?.details
    ? { message, details: error.details }
    : { message };

  res.status(statusCode).json(payload);

  _next(); // @TODO not used void
};
