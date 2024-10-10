import { NextFunction, Request, Response } from "express";
import { Application } from "src/types";

export class UserController extends Application {
  createUser = async (req: Request, res: Response, next: NextFunction) => {};

  getUsers = async (req: Request, res: Response, next: NextFunction) => {};

  createPost = async (req: Request, res: Response, next: NextFunction) => {};

  getTopUsers = async (req: Request, res: Response, next: NextFunction) => {};
}
