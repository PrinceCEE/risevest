import "reflect-metadata";
require("module-alias/register");
import dotenv from "dotenv";
import http from "http";
import { startServer } from "./api";
import { db, migration, PostRepository, UserRepository } from "./database";
import { PostService, UserService } from "./services";
import { IConfig } from "./types";
import { cache } from "./cache";

async function main() {
  dotenv.config();

  const userRepository = new UserRepository();
  const postRepository = new PostRepository();

  const userService = new UserService(userRepository);
  const postService = new PostService(postRepository);

  const config: IConfig = {
    env: {
      DB_URL: process.env.DB_URL!,
      PORT: process.env.PORT || "3000",
      JWT_SECRET: process.env.JWT_SECRET!,
      REDIS_URL: process.env.REDIS_URL!,
    },
    services: { userService, postService },
  };

  db.connectDB(config.env.DB_URL);
  await db.query(migration.up);
  await cache.connectCache(config.env.REDIS_URL);
  const server = await startServer(config);

  process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
}

async function gracefulShutdown(server: http.Server, signal: string) {
  try {
    console.log(`\nReceived ${signal} signal. Starting graceful shutdown\n`);

    await cache.disconnectCache();
    await new Promise((res, rej) => {
      server.close((err) => {
        if (err) {
          rej(err);
          return;
        }

        res(null);
      });
    });
    await db.closeDB();
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

main();
