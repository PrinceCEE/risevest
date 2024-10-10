import { Router } from "express";
import { AuthMiddlewares } from "../middlewares";
import { UserController } from "../controllers";

export const setupUsersRoutes = (
  authMiddleware: AuthMiddlewares,
  usersController: UserController
) => {
  const r = Router();

  r.post("/", authMiddleware.validateUser, usersController.createUser);
  r.get("/", authMiddleware.validateUser, usersController.getUsers);
  r.post(
    "/:userId/posts",
    authMiddleware.validateUser,
    usersController.createPost
  );
  r.get("/top-users", authMiddleware.validateUser, usersController.getUsers);

  return r;
};
