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
    getTopUsers: async () => [],
    findByUsername: async () => {},
  };

  const userService = new UserService(userRepositoryMock);

  await t.test("Create User", async (t) => {
    t.mock
      .method(userRepositoryMock, "createUser")
      .mock.mockImplementationOnce(() => Promise.resolve(user));
    t.mock
      .method(utils, "generateID")
      .mock.mockImplementationOnce(() => user.id);

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

  await t.test("Get top users", async (t) => {
    t.mock
      .method(userRepositoryMock, "getTopUsers")
      .mock.mockImplementationOnce(() =>
        Promise.resolve([
          {
            user_id: utils.generateID(),
            username: faker.internet.userName(),
            post_count: Math.floor(Math.random() * 100),
            post_title: faker.lorem.paragraph(1),
            latest_comment: faker.lorem.paragraph(3),
            comment_created_at: faker.date.anytime(),
          },
          {
            user_id: utils.generateID(),
            username: faker.internet.userName(),
            post_count: Math.floor(Math.random() * 100),
            post_title: faker.lorem.paragraph(1),
            latest_comment: faker.lorem.paragraph(3),
            comment_created_at: faker.date.anytime(),
          },
          {
            user_id: utils.generateID(),
            username: faker.internet.userName(),
            post_count: Math.floor(Math.random() * 100),
            post_title: faker.lorem.paragraph(1),
            latest_comment: faker.lorem.paragraph(3),
            comment_created_at: faker.date.anytime(),
          },
        ])
      );

    const topUsers = await userService.getTopUsers();
    assert.ok(topUsers.length === 3);
    assert.ok(topUsers[0].postCount > 0);
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
