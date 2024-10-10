import { NextFunction, Request, Response } from "express";
import { Application } from "src/types";

export class PostController extends Application {
  addComment = async (req: Request, res: Response, next: NextFunction) => {};
}
