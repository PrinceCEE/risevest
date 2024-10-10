import { PostService, UserService } from "src/services";

export interface IConfig {
  env: {};
  services: {
    postService: PostService;
    userService: UserService;
  };
}

export abstract class Application {
  constructor(private readonly config: IConfig) {}
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}
