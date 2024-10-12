import { Router } from "express";
import { AuthMiddlewares } from "../middlewares";
import { UserController } from "../controllers";
import { CreatePostDto, CreateUserDto } from "../dtos";

export const setupUsersRoutes = (
  authMiddleware: AuthMiddlewares,
  usersController: UserController
) => {
  const r = Router();

  r.post(
    "/",
    authMiddleware.validatePayload(CreateUserDto),
    usersController.createUser
  );
  r.get("/", authMiddleware.validateUser, usersController.getUsers);
  r.post(
    "/:userId/posts",
    authMiddleware.validateUser,
    authMiddleware.validatePayload(CreatePostDto),
    usersController.createPost
  );
  r.get(
    "/:userId/posts",
    authMiddleware.validateUser,
    usersController.getUserPosts
  );
  r.get("/top-users", authMiddleware.validateUser, usersController.getTopUsers);

  return r;
};
