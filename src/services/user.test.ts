require("module-alias/register");
import assert from "node:assert";
import { faker } from "@faker-js/faker";
import { test } from "node:test";
import { UserRepository } from "src/database";
import * as utils from "src/utils";
import { UserService } from "./user";

test("Test services", async (t) => {
  const user = {
    id: utils.generateID(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password({ length: 100 }),
    created_at: faker.date.anytime(),
    updated_at: faker.date.anytime(),
  };

  const userRepositoryMock: UserRepository = {
    createUser: async () => {},
    findByEmail: async () => {},
    findById: async () => {},
    getUsers: async () => [],
    getTopUsers: async () => {},
  };

  const userService = new UserService(userRepositoryMock);

  await t.test("Create User", async (t) => {
    t.mock
      .method(userRepositoryMock, "createUser")
      .mock.mockImplementationOnce(() => Promise.resolve(user));
    t.mock.method(utils, "generateID").mock.mockImplementation(() => user.id);

    const _user = await userService.createUser({
      email: user.email,
      name: user.name,
      password: user.password,
      username: user.username,
    });

    assert.ok(_user);
    assert.equal(_user.id, user.id);
    assert.equal(_user.createdAt, user.created_at);
    assert.equal(_user.updatedAt, user.updated_at);
  });

  await t.test("Get Users", async (t) => {
    t.mock
      .method(userRepositoryMock, "getUsers")
      .mock.mockImplementationOnce(() => Promise.resolve([user]));

    const users = await userService.getUsers();

    assert.ok(users.length > 0);
    assert.equal(users[0].id, user.id);
    assert.equal(users[0].createdAt, user.created_at);
    assert.equal(users[0].updatedAt, user.updated_at);
  });

  await t.test("Get user by ID", async (t) => {
    t.mock
      .method(userRepositoryMock, "findById")
      .mock.mockImplementationOnce(() => Promise.resolve(user));

    const _user = await userService.findById(user.id);

    assert.ok(_user);
    assert.equal(_user.id, user.id);
    assert.equal(_user.createdAt, user.created_at);
    assert.equal(_user.updatedAt, user.updated_at);
  });
});
