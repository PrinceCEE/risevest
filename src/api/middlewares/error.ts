import { NextFunction, Request, Response } from "express";
import { Application } from "src/types";

export class ErrorMiddlewares extends Application {
  handleError = async (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {};

  handle404 = async (req: Request, res: Response, next: NextFunction) => {};
}
