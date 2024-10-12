require("module-alias/register");
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { faker } from "@faker-js/faker";
import { mock, test } from "node:test";
import assert from "node:assert";
import {
  ApiResponse,
  IConfig,
  MockFn,
  PostResponse,
  TopUsersResponse,
  UserResponse,
} from "src/types";
import { PostService, UserService } from "src/services";
import * as utils from "src/utils";
import { UserController } from "./users";

test("UserController tests", async (t) => {
  const req = {
    headers: {},
    body: {},
    params: {},
  } as Request;
  const res = {
    json: mock.fn(),
  } as unknown as Response;
  const next = mock.fn();

  const configMock: IConfig = {
    env: {} as any,
    services: {
      userService: {
        findById: mock.fn(),
        createUser: mock.fn(),
        getUsers: mock.fn(),
        findUserPosts: mock.fn(),
        getTopUsers: mock.fn(),
        findByEmail: mock.fn(),
        findByUsername: mock.fn(),
      } as unknown as UserService,
      postService: {
        createPost: mock.fn(),
        findUserPosts: mock.fn(),
      } as unknown as PostService,
    },
  };

  const user = {
    id: utils.generateID(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password({ length: 100 }),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
  };

  const post = {
    id: utils.generateID(),
    title: faker.lorem.paragraph(1),
    content: faker.lorem.paragraph(3),
    userId: user.id,
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
  };

  let accessToken = sign({ sub: user.id }, "s3cret", {
    expiresIn: "1hr",
  });
  const userController = new UserController(configMock);

  await t.test("Create user", async (t) => {
    const createUserDto = {
      email: user.email,
      username: user.username,
      name: user.name,
      password: user.password,
    };

    mock
      .method(utils, "hashPassword")
      .mock.mockImplementationOnce(() =>
        utils.hashPassword(createUserDto.password)
      );

    mock
      .method(utils, "generateAccessToken")
      .mock.mockImplementationOnce(() => Promise.resolve(accessToken));

    mock
      .method(configMock.services.userService, "createUser")
      .mock.mockImplementationOnce(() => Promise.resolve(user));
    mock
      .method(configMock.services.userService, "findByEmail")
      .mock.mockImplementationOnce(() => Promise.resolve(null as any));
    mock
      .method(configMock.services.userService, "findByUsername")
      .mock.mockImplementationOnce(() => Promise.resolve(null as any));

    req.body = createUserDto;
    assert.equal((res.json as MockFn).mock.callCount(), 0);
    await userController.createUser(req, res, next);
    assert.equal(next.mock.callCount(), 0);
    assert.equal((res.json as MockFn).mock.callCount(), 1);

    const args = (res.json as MockFn).mock.calls[0].arguments;
    const response: ApiResponse<{ accessToken: string; user: UserResponse }> = (
      args as any[]
    )[0];
    assert.ok(response);
    assert.equal(response.success, true);
    assert.equal(response.message, "User created");
    assert.equal(response.data?.user.id, user.id);
    assert.equal(response.data?.accessToken, accessToken);

    delete req.body;
    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });

  await t.test("Get users", async (t) => {
    mock
      .method(configMock.services.userService, "getUsers")
      .mock.mockImplementationOnce(() => Promise.resolve([user]));

    assert.equal((res.json as MockFn).mock.callCount(), 0);
    await userController.getUsers(req, res, next);
    assert.equal(next.mock.callCount(), 0);
    assert.equal((res.json as MockFn).mock.callCount(), 1);

    const args = (res.json as MockFn).mock.calls[0].arguments;
    const response: ApiResponse<{ users: UserResponse[] }> = (args as any[])[0];
    assert.ok(response);
    assert.equal(response.success, true);
    assert.equal(response.message, "Users fetched");
    assert.equal(response.data?.users[0].id, user.id);

    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });

  await t.test("Create post", async (t) => {
    req.user = user;
    req.params.userId = user.id;

    const createPostDto = {
      title: post.title,
      content: post.content,
    };

    mock
      .method(configMock.services.postService, "createPost")
      .mock.mockImplementationOnce(() => Promise.resolve(post));

    req.body = createPostDto;
    assert.equal((res.json as MockFn).mock.callCount(), 0);
    await userController.createPost(req, res, next);
    assert.equal(next.mock.callCount(), 0);
    assert.equal((res.json as MockFn).mock.callCount(), 1);

    const args = (res.json as MockFn).mock.calls[0].arguments;
    const response: ApiResponse<{ post: PostResponse }> = (args as any[])[0];
    assert.ok(response);
    assert.equal(response.success, true);
    assert.equal(response.message, "Post created");
    assert.equal(response.data?.post.id, post.id);

    delete req.body;
    delete req.user;
    req.params = {};

    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });

  await t.test("Create post throws error", async (t) => {
    req.user = user;
    req.params.userId = utils.generateID();

    const createPostDto = {
      title: post.title,
      content: post.content,
    };

    mock
      .method(configMock.services.postService, "createPost")
      .mock.mockImplementationOnce(() => Promise.resolve(post));

    req.body = createPostDto;
    assert.equal((res.json as MockFn).mock.callCount(), 0);
    await userController.createPost(req, res, next);
    assert.equal(next.mock.callCount(), 1);
    assert.equal((res.json as MockFn).mock.callCount(), 0);

    const args = next.mock.calls[0].arguments[0];
    assert.ok(args);
    assert.equal(args.message, "Unauthorized");

    delete req.body;
    delete req.user;
    req.params = {};

    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });

  await t.test("Get user posts", async (t) => {
    req.user = user;
    req.params.userId = user.id;

    mock
      .method(configMock.services.postService, "findUserPosts")
      .mock.mockImplementationOnce(() => Promise.resolve([post]));

    assert.equal((res.json as MockFn).mock.callCount(), 0);
    await userController.getUserPosts(req, res, next);
    assert.equal(next.mock.callCount(), 0);
    assert.equal((res.json as MockFn).mock.callCount(), 1);

    const args = (res.json as MockFn).mock.calls[0].arguments;
    const response: ApiResponse<{ posts: PostResponse[] }> = (args as any[])[0];
    assert.ok(response);
    assert.equal(response.success, true);
    assert.equal(response.message, "Fetched user posts");
    assert.equal(response.data?.posts[0].id, post.id);

    delete req.body;
    delete req.user;
    req.params = {};

    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });

  await t.test("Get top users", async (t) => {
    req.user = user;

    mock
      .method(configMock.services.userService, "getTopUsers")
      .mock.mockImplementationOnce(() =>
        Promise.resolve([
          {
            userId: utils.generateID(),
            username: faker.internet.userName(),
            postCount: Math.floor(Math.random() * 100),
            postTitle: faker.lorem.paragraph(1),
            latestComment: faker.lorem.paragraph(3),
            commentCreatedAt: faker.date.anytime(),
          },
          {
            userId: utils.generateID(),
            username: faker.internet.userName(),
            postCount: Math.floor(Math.random() * 100),
            postTitle: faker.lorem.paragraph(1),
            latestComment: faker.lorem.paragraph(3),
            commentCreatedAt: faker.date.anytime(),
          },
          {
            userId: utils.generateID(),
            username: faker.internet.userName(),
            postCount: Math.floor(Math.random() * 100),
            postTitle: faker.lorem.paragraph(1),
            latestComment: faker.lorem.paragraph(3),
            commentCreatedAt: faker.date.anytime(),
          },
        ])
      );

    assert.equal((res.json as MockFn).mock.callCount(), 0);
    await userController.getTopUsers(req, res, next);
    assert.equal(next.mock.callCount(), 0);
    assert.equal((res.json as MockFn).mock.callCount(), 1);

    const args = (res.json as MockFn).mock.calls[0].arguments;
    const response: ApiResponse<{ users: TopUsersResponse[] }> = (
      args as any[]
    )[0];
    assert.ok(response);
    assert.equal(response.success, true);
    assert.equal(response.message, "Fetched top users");
    assert.ok(response.data?.users[0].postCount! > 0);

    delete req.body;
    delete req.user;
    req.params = {};

    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });
});
