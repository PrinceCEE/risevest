import { startServer } from "./api";
import { PostRepository, UserRepository } from "./database";
import { PostService, UserService } from "./services";
import { IConfig } from "./types";

async function main() {
  const userRepository = new UserRepository();
  const postRepository = new PostRepository();

  const userService = new UserService(userRepository);
  const postService = new PostService(postRepository);

  const config: IConfig = {
    env: {},
    services: { userService, postService },
  };

  await startServer(config);
}

main();
