import { Router } from "express";
import { AuthMiddlewares } from "../middlewares";
import { PostController } from "../controllers";
import { CreateCommentDto } from "../dtos";

export const setupPostsRoutes = (
  authMiddleware: AuthMiddlewares,
  postsController: PostController
) => {
  const r = Router();

  r.post(
    "/:postId/comments",
    authMiddleware.validateUser,
    authMiddleware.validatePayload(CreateCommentDto),
    postsController.addComment
  );

  return r;
};
