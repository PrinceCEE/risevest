require("module-alias/register");
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { faker } from "@faker-js/faker";
import { mock, test } from "node:test";
import assert from "node:assert";
import { IConfig } from "src/types";
import { AuthMiddlewares } from "./auth";
import { PostService, UserService } from "src/services";
import * as utils from "src/utils";
import { UnauthorizedError } from "src/errors";
import { CreateUserDto } from "../dtos";

test("AuthMiddleware tests", async (t) => {
  const req = {
    headers: {},
    body: {},
  } as Request;
  const res = {} as Response;
  const next = mock.fn();

  const configMock: IConfig = {
    env: {} as any,
    services: {
      userService: { findById: mock.fn() } as unknown as UserService,
      postService: {} as PostService,
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

  const accessToken = sign({ sub: user.id }, "s3cret", {
    expiresIn: "1hr",
  });
  const authMiddleware = new AuthMiddlewares(configMock);

  await t.test("Validate user access token", async (t) => {
    req.headers!.authorization = `Bearer ${accessToken}`;

    mock
      .method(utils, "verifyToken")
      .mock.mockImplementationOnce(() => Promise.resolve({ sub: user.id }));

    mock
      .method(configMock.services.userService, "findById")
      .mock.mockImplementationOnce(() => Promise.resolve(user));

    assert.equal(next.mock.callCount(), 0);
    await authMiddleware.validateUser(req, res, next);
    assert.equal(next.mock.callCount(), 1);
    assert.ok(req.user);
    assert.equal(req.user.id, user.id);

    delete req.user;
    next.mock.resetCalls();
  });

  await t.test("Validate user access token throws error", async (t) => {
    req.headers!.authorization = `Bearer ${accessToken.slice(
      0,
      accessToken.length - 2
    )}`;

    mock
      .method(utils, "verifyToken")
      .mock.mockImplementationOnce(() =>
        Promise.reject(new UnauthorizedError("Invalid access token"))
      );

    assert.equal(next.mock.callCount(), 0);
    await authMiddleware.validateUser(req, res, next);
    assert.equal(next.mock.callCount(), 1);
    assert.equal(
      next.mock.calls[0].arguments[0].message,
      "Invalid access token"
    );
    assert.ok(!req.user);

    next.mock.resetCalls();
  });

  await t.test("Validate request payload", async (t) => {
    const createUserDto = {
      email: user.email.toUpperCase(),
      name: user.name,
      password: user.password,
      username: user.username,
    };

    req.body = createUserDto;
    assert.equal(next.mock.callCount(), 0);
    await authMiddleware.validatePayload(CreateUserDto)(req, res, next);
    assert.equal(next.mock.callCount(), 1);
    assert.ok(!next.mock.calls[0].arguments[0]);
    assert.equal(req.body.email, createUserDto.email.toLowerCase());

    next.mock.resetCalls();
  });

  await t.test("Validate request payload throws error", async (t) => {
    const createUserDto = {
      email: user.email.toUpperCase(),
      name: user.name,
      password: user.password,
    };

    req.body = createUserDto;
    assert.equal(next.mock.callCount(), 0);
    await authMiddleware.validatePayload(CreateUserDto)(req, res, next);
    assert.equal(next.mock.callCount(), 1);
    assert.equal(
      next.mock.calls[0].arguments[0].message,
      "username must be a string"
    );
  });
});
