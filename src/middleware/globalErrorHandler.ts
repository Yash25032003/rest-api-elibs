import { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  

  return res.status(statusCode).json({
    message: err.message,
    // detailed info of error is contained in errorStack only in development stage not in production stage.
    errorStack: config.env === "development" ? err.stack : "",
  });
};

export default globalErrorHandler;
