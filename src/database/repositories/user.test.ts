require("module-alias/register");
import assert from "node:assert";
import { faker } from "@faker-js/faker";
import { describe, before, after, it } from "node:test";
import { db } from "../connection";
import { migration } from "../migration";

import { generateID } from "src/utils";
import { UserRepository } from "./user";
import { CreateUser } from "src/types";

const tearDownDB = async (users: CreateUser[]) => {
  const query = `DELETE FROM users WHERE id = ANY($1)`;
  await db.query(query, [users.map((u) => u.id)]);
};

describe("User repository tests", async () => {
  const users: CreateUser[] = [];
  const userRepository = new UserRepository();

  for (let i = 0; i < 5; i++) {
    users.push({
      email: faker.internet.email().toLowerCase(),
      username: faker.internet.userName().toLowerCase(),
      id: generateID(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 100 }),
    });
  }

  before(async () => {
    db.connectDB(
      "postgres://postgres:password@localhost/risevest?sslmode=disable"
    );

    await db.query(migration.up);
  });

  after(async () => {
    await tearDownDB(users);
    await db.closeDB();
  });

  await it("creates new user", async () => {
    const createdUsers = [];
    for await (const user of users) {
      createdUsers.push(await userRepository.createUser(user));
    }

    assert.equal(createdUsers.length, 5);

    for (const user of createdUsers) {
      assert.ok("created_at" in user, "'created_at' does not exist");
      assert.ok("updated_at" in user, "'updated_at' does not exist");
    }
  });

  await it("fetches users", async () => {
    const users = await userRepository.getUsers();
    assert.ok(users.length > 0);

    for (const user of users) {
      assert.ok("created_at" in user, "'created_at' does not exist");
      assert.ok("updated_at" in user, "'updated_at' does not exist");
    }
  });

  await it("fetches user by id", async () => {
    const user = await userRepository.findById(users[0].id);
    assert.ok(user.id);
    assert.ok(user.email);
    assert.ok(user.created_at);
  });

  await it("fetches user by email", async () => {
    const user = await userRepository.findByEmail(users[0].email);
    assert.ok(user.id);
    assert.ok(user.email);
    assert.ok(user.created_at);
  });

  await it("fetches nonexisten user by email", async () => {
    const user = await userRepository.findByEmail("test@gmail.com");
    assert.ok(!user);
  });
});
