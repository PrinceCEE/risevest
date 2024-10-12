import { NextFunction, Request, Response } from "express";
import { BaseError } from "src/errors";
import { ApiResponse, Application } from "src/types";

export class ErrorMiddlewares extends Application {
  handleError = async (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const response: ApiResponse = {
      success: false,
      message: err.message,
    };

    res.status(err instanceof BaseError ? err.statusCode : 500).json(response);
  };

  handle404 = async (req: Request, res: Response, next: NextFunction) => {
    const response: ApiResponse = {
      success: false,
      message: "Not found",
    };
    res.status(404).json(response);
  };
}
