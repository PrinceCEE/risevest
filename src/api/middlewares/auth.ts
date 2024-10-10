import { NextFunction, Request, Response } from "express";
import { Application } from "src/types";

export class AuthMiddlewares extends Application {
  validateUser = async (req: Request, res: Response, next: NextFunction) => {};
}
