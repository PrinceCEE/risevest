import { NextFunction, Request, Response } from "express";
import {
  ApiResponse,
  Application,
  PostResponse,
  TopUsersResponse,
  UserResponse,
} from "src/types";
import { CreatePostDto, CreateUserDto } from "../dtos";
import {
  generateAccessToken,
  hashPassword,
  mapPostToPostResponse,
  mapUserToUserResponse,
} from "src/utils";
import { BadRequestError, UnauthorizedError } from "src/errors";
import { cache } from "src/cache";

export class UserController extends Application {
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateUserDto = req.body;
      data.password = await hashPassword(data.password);

      if (await this.config.services.userService.findByEmail(data.email)) {
        throw new BadRequestError("User with email already exists");
      }
      if (
        await this.config.services.userService.findByUsername(data.username)
      ) {
        throw new BadRequestError("User with username already exists");
      }

      const user = await this.config.services.userService.createUser(data);
      const accessToken = await generateAccessToken({ sub: user.id });

      const response: ApiResponse<{ accessToken: string; user: UserResponse }> =
        {
          success: true,
          message: "User created",
          data: {
            accessToken,
            user: mapUserToUserResponse(user),
          },
        };

      res.json(response);
    } catch (err: any) {
      next(err);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.config.services.userService.getUsers();
      const response: ApiResponse<{ users: UserResponse[] }> = {
        success: true,
        message: "Users fetched",
        data: { users: users.map((u) => mapUserToUserResponse(u)) },
      };
      res.json(response);
    } catch (err: any) {
      next(err);
    }
  };

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user || user.id !== req.params["userId"]) {
        throw new UnauthorizedError();
      }

      const data: CreatePostDto = req.body;
      const post = await this.config.services.postService.createPost({
        title: data.title,
        content: data.content,
        userId: user.id,
      });

      const response: ApiResponse<{ post: PostResponse }> = {
        success: true,
        message: "Post created",
        data: { post: mapPostToPostResponse(post) },
      };
      res.json(response);
    } catch (err: any) {
      next(err);
    }
  };

  getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user || user.id !== req.params["userId"]) {
        throw new UnauthorizedError();
      }

      const posts = await this.config.services.postService.findUserPosts(
        user.id
      );

      const response: ApiResponse<{ posts: PostResponse[] }> = {
        success: true,
        message: "Fetched user posts",
        data: { posts: posts.map((p) => mapPostToPostResponse(p)) },
      };
      res.json(response);
    } catch (err: any) {
      next(err);
    }
  };

  getTopUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let topUsers: TopUsersResponse[] = await cache.get("top-users");
      if (topUsers?.length) {
        const response: ApiResponse<{ users: TopUsersResponse[] }> = {
          success: true,
          message: "Fetched top users",
          data: { users: topUsers },
        };

        res.json(response);
        return;
      }

      topUsers = await this.config.services.userService.getTopUsers();
      if (topUsers.length === 3) {
        await cache.set("top-users", topUsers); // cache it when it's up to 3 top users
      }
      const response: ApiResponse<{ users: TopUsersResponse[] }> = {
        success: true,
        message: "Fetched top users",
        data: { users: topUsers },
      };
      res.json(response);
    } catch (err: any) {
      next(err);
    }
  };
}
