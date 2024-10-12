require("module-alias/register");
import { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import { mock, test } from "node:test";
import assert from "node:assert";
import { ApiResponse, CommentResponse, IConfig, MockFn } from "src/types";
import { PostService, UserService } from "src/services";
import * as utils from "src/utils";
import { PostController } from "./posts";

test("PostController tests", async (t) => {
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
      userService: {} as unknown as UserService,
      postService: {
        findPostById: mock.fn(),
        createComment: mock.fn(),
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

  const comment = {
    id: utils.generateID(),
    content: faker.lorem.paragraph(3),
    userId: user.id,
    postId: post.id,
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
  };

  const postController = new PostController(configMock);

  await t.test("Create comment", async (t) => {
    const createCommentDto = {
      content: comment.content,
    };

    mock
      .method(configMock.services.postService, "findPostById")
      .mock.mockImplementationOnce(() => Promise.resolve(post));
    mock
      .method(configMock.services.postService, "createComment")
      .mock.mockImplementationOnce(() => Promise.resolve(comment));

    req.body = createCommentDto;
    req.user = user;
    req.params = { postId: post.id };
    assert.equal((res.json as MockFn).mock.callCount(), 0);
    await postController.addComment(req, res, next);
    assert.equal(next.mock.callCount(), 0);
    assert.equal((res.json as MockFn).mock.callCount(), 1);

    const args = (res.json as MockFn).mock.calls[0].arguments;
    const response: ApiResponse<{ comment: CommentResponse }> = (
      args as any[]
    )[0];
    assert.ok(response);
    assert.equal(response.success, true);
    assert.equal(response.message, "Comment added");
    assert.equal(response.data?.comment.id, comment.id);

    delete req.body;
    req.params = {};

    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });

  await t.test("Create comment throws error", async (t) => {
    const createCommentDto = {
      content: comment.content,
    };

    mock
      .method(configMock.services.postService, "findPostById")
      .mock.mockImplementationOnce(() => Promise.resolve(null as any));
    mock
      .method(configMock.services.postService, "createComment")
      .mock.mockImplementationOnce(() => Promise.resolve(comment));

    req.body = createCommentDto;
    req.user = user;
    req.params = { postId: utils.generateID() };

    assert.equal((res.json as MockFn).mock.callCount(), 0);
    assert.equal(next.mock.callCount(), 0);
    await postController.addComment(req, res, next);
    assert.equal(next.mock.callCount(), 1);
    assert.equal((res.json as MockFn).mock.callCount(), 0);

    const args = next.mock.calls[0].arguments[0];
    assert.ok(args);
    assert.equal(args.message, "Post not found");

    delete req.body;
    delete req.user;
    req.params = {};

    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });

  await t.test("Create comment throws error", async (t) => {
    const createCommentDto = {
      content: comment.content,
    };

    mock
      .method(configMock.services.postService, "findPostById")
      .mock.mockImplementationOnce(() => Promise.resolve(null as any));
    mock
      .method(configMock.services.postService, "createComment")
      .mock.mockImplementationOnce(() => Promise.resolve(comment));

    req.body = createCommentDto;
    req.params = { postId: utils.generateID() };

    assert.equal((res.json as MockFn).mock.callCount(), 0);
    assert.equal(next.mock.callCount(), 0);
    await postController.addComment(req, res, next);
    assert.equal(next.mock.callCount(), 1);
    assert.equal((res.json as MockFn).mock.callCount(), 0);

    const args = next.mock.calls[0].arguments[0];
    assert.ok(args);
    assert.equal(args.message, "Unauthorized");

    delete req.body;
    req.params = {};

    next.mock.resetCalls();
    (res.json as MockFn).mock.resetCalls();
  });
});
