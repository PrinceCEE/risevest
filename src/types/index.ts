import { User } from "src/database";
import { PostService, UserService } from "src/services";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export interface IConfig {
  env: {
    DB_URL: string;
    PORT: string;
    JWT_SECRET: string;
  };
  services: {
    postService: PostService;
    userService: UserService;
  };
}

export abstract class Application {
  constructor(protected readonly config: IConfig) {}
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CommentResponse {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  userId: string;
  comments?: CommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  username: string;
  posts?: PostResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TopUsersResponse {
  id: string;
  name: string;
  postTitle: string;
  commentContent: string;
}

export type CreateUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  username: string;
};

export type CreatePost = {
  id: string;
  title: string;
  content: string;
  userId: string;
};

export type CreateComment = {
  id: string;
  content: string;
  userId: string;
  postId: string;
};
