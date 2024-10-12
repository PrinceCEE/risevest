import { NextFunction, Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { Application } from "src/types";
import { plainToInstance } from "class-transformer";
import { BadRequestError, UnauthorizedError } from "src/errors";
import { verifyToken } from "src/utils";
import { JwtPayload } from "jsonwebtoken";

export class AuthMiddlewares extends Application {
  validateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        throw new UnauthorizedError("Access token missing");
      }

      const payload = (await verifyToken(accessToken)) as JwtPayload;
      if (!payload) {
        throw new UnauthorizedError("Invalid access token");
      }

      const user = await this.config.services.userService.findById(
        payload.sub!
      );
      if (!user) {
        throw new UnauthorizedError("Invalid access token");
      }

      req.user = user;
      next();
    } catch (err: any) {
      next(err);
    }
  };

  validatePayload = <T extends Object>(cls: { new (): T }) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const o = plainToInstance(cls, req.body);
        await validateOrReject(o);
        req.body = o;
        next();
      } catch (err: any) {
        const _err = new BadRequestError(
          Object.values(err[0]?.constraints)[0] as string
        );
        _err.stack = err?.stack;
        next(_err);
      }
    };
  };
}
