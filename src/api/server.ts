import express from "express";
import { IConfig } from "src/types";
import { routers } from "./routes";
import { AuthMiddlewares, ErrorMiddlewares } from "./middlewares";
import { PostController, UserController } from "./controllers";

export const startServer = async (config: IConfig) => {
  const app = express();
  const api = express();

  const authMiddleware = new AuthMiddlewares(config);
  const errorMiddleware = new ErrorMiddlewares(config);
  const userController = new UserController(config);
  const postController = new PostController(config);

  app.use("/api/v1", api);
  api.use(
    "/api/v1/users",
    routers.setupUsersRoutes(authMiddleware, userController)
  );
  api.use(
    "/api/v1/posts",
    routers.setupPostsRoutes(authMiddleware, postController)
  );
  app.use(errorMiddleware.handleError);
  app.use(errorMiddleware.handle404);

  app.listen("", () => {});
};
