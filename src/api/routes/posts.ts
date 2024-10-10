import { Router } from "express";
import { AuthMiddlewares } from "../middlewares";
import { PostController } from "../controllers";

export const setupPostsRoutes = (
  authMiddleware: AuthMiddlewares,
  postsController: PostController
) => {
  const r = Router();

  r.post(
    "/:postId/comments",
    authMiddleware.validateUser,
    postsController.addComment
  );

  return r;
};
