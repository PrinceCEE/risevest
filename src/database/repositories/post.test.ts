require("module-alias/register");
import assert from "node:assert";
import { faker } from "@faker-js/faker";
import { describe, before, after, it } from "node:test";
import { db } from "../connection";
import { migration } from "../migration";
import { generateID } from "src/utils";
import { UserRepository } from "./user";
import { CreateComment, CreatePost, CreateUser } from "src/types";
import { PostRepository } from "./post";

const tearDownDB = async (
  user: CreateUser,
  comment: CreateComment,
  post: CreatePost
) => {
  await Promise.all([
    db.query("DELETE FROM comments WHERE id = $1", [comment.id]),
    db.query("DELETE FROM posts WHERE id = $1", [post.id]),
    db.query("DELETE FROM users WHERE id = $1", [user.id]),
  ]);
};

describe("Post repository tests", async () => {
  const userRepository = new UserRepository();
  const postRepository = new PostRepository();

  let post: any;
  let comment: any;

  const user: CreateUser = {
    email: faker.internet.email().toLowerCase(),
    username: faker.internet.userName().toLowerCase(),
    id: generateID(),
    name: faker.person.fullName(),
    password: faker.internet.password({ length: 100 }),
  };

  before(async () => {
    db.connectDB(
      "postgres://postgres:password@localhost/risevest?sslmode=disable"
    );

    await db.query(migration.up);

    await userRepository.createUser(user);
  });

  after(async () => {
    await tearDownDB(user, comment, post);
    await db.closeDB();
  });

  await it("creates new post", async () => {
    const postDto: CreatePost = {
      id: generateID(),
      title: faker.lorem.paragraph(1),
      content: faker.lorem.paragraph(5),
      userId: user.id,
    };

    post = await postRepository.createPost(postDto);
    assert.ok(post);
    assert.equal(post.id, postDto.id);
    assert.equal(post.user_id, user.id);
    assert.ok(post.created_at);
    assert.ok(post.updated_at);
  });

  await it("creates new comment", async () => {
    const commentDto: CreateComment = {
      id: generateID(),
      postId: post.id,
      userId: user.id,
      content: faker.lorem.paragraph(3),
    };

    comment = await postRepository.createComment(commentDto);

    assert.ok(comment);
    assert.equal(comment.id, comment.id);
    assert.equal(comment.post_id, post.id);
    assert.equal(comment.user_id, user.id);
    assert.ok(comment.created_at);
    assert.ok(comment.updated_at);
  });

  it("fetches a post by id", async () => {
    const _post = await postRepository.findPostById(post.id);
    assert.ok(_post);
    assert.equal(_post.id, post.id);
    assert.equal(_post.user_id, post.user_id);
  });

  it("fetches a comment by id", async () => {
    const _comment = await postRepository.findCommendById(comment.id);
    assert.ok(_comment);
    assert.equal(_comment.id, comment.id);
    assert.equal(_comment.post_id, comment.post_id);
    assert.equal(_comment.user_id, comment.user_id);
  });

  it("fetches posts by userId", async () => {
    const posts = await postRepository.findPostsByUserId(user.id);
    assert.ok(posts.length > 0);
    assert.equal(posts.length, 1);
    assert.equal(posts[0].id, post.id);
  });

  it("fetches posts by nonexistent userId", async () => {
    const posts = await postRepository.findPostsByUserId(generateID());
    assert.ok(posts.length === 0);
  });

  it("fetch top users", async (t) => {
    let users = [];
    for await (const _ of new Array(10).fill(null)) {
      users.push(
        await userRepository.createUser({
          email: faker.internet.email().toLowerCase(),
          username: faker.internet.userName().toLowerCase(),
          id: generateID(),
          name: faker.person.fullName(),
          password: faker.internet.password({ length: 100 }),
        })
      );
    }

    const posts = [];
    for await (const _ of new Array(100).fill(null)) {
      const idx = Math.floor(Math.random() * users.length);
      posts.push(
        await postRepository.createPost({
          id: generateID(),
          title: faker.lorem.paragraph(1),
          content: faker.lorem.paragraph(5),
          userId: users[idx].id,
        })
      );
    }

    const comments = [];
    for await (const post of posts) {
      const idxUsers = Math.floor(Math.random() * users.length);

      comments.push(
        await postRepository.createComment({
          id: generateID(),
          postId: post.id,
          userId: users[idxUsers].id,
          content: faker.lorem.paragraph(3),
        })
      );
    }

    const topUsers = await userRepository.getTopUsers();
    assert.equal(topUsers.length, 3);

    await Promise.all([
      db.query("DELETE FROM comments WHERE id = ANY($1)", [
        comments.map((c) => c.id),
      ]),
      db.query("DELETE FROM posts WHERE id = ANY($1)", [
        posts.map((p) => p.id),
      ]),
      db.query("DELETE FROM users WHERE id = ANY($1)", [
        users.map((u) => u.id),
      ]),
    ]);
  });
});
