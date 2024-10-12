require("module-alias/register");
import assert from "node:assert";
import { faker } from "@faker-js/faker";
import { test } from "node:test";
import { PostService } from "./post";
import { PostRepository } from "src/database";
import * as utils from "src/utils";
import { InternalServerError } from "src/errors";

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
  const post = {
    id: utils.generateID(),
    title: faker.lorem.paragraph(1),
    content: faker.lorem.paragraph(3),
    user_id: user.id,
    created_at: faker.date.anytime(),
    updated_at: faker.date.anytime(),
  };
  const comment = {
    id: utils.generateID(),
    content: faker.lorem.paragraph(3),
    user_id: user.id,
    post_id: post.id,
    created_at: faker.date.anytime(),
    updated_at: faker.date.anytime(),
  };

  const postRepositoryMock: PostRepository = {
    createComment: async () => {},
    createPost: async () => {},
    findCommendById: async () => {},
    findPostById: async () => {},
    findPostsByUserId: async () => [],
  };

  const postService = new PostService(postRepositoryMock);

  await t.test("Create Post", async (t) => {
    t.mock
      .method(postRepositoryMock, "createPost")
      .mock.mockImplementationOnce(() => Promise.resolve(post));
    t.mock.method(utils, "generateID").mock.mockImplementation(() => post.id);

    const _post = await postService.createPost({
      content: post.content,
      title: post.title,
      userId: user.id,
    });

    assert.ok(_post);
    assert.equal(_post.id, post.id);
    assert.equal(_post.createdAt, post.created_at);
    assert.equal(_post.updatedAt, post.updated_at);
  });

  await t.test("Can't create Post", async (t) => {
    assert.rejects(async () => {
      t.mock
        .method(postRepositoryMock, "createPost")
        .mock.mockImplementationOnce(() => Promise.resolve(null));

      return postService.createPost({
        content: post.content,
        title: post.title,
        userId: user.id,
      });
    }, new InternalServerError("Error creating post. Try again"));
  });

  await t.test("Find post by ID", async (t) => {
    t.mock
      .method(postRepositoryMock, "findPostById")
      .mock.mockImplementationOnce(() => Promise.resolve(post));

    const _post = await postService.findPostById(post.id);

    assert.ok(_post);
    assert.equal(_post.id, post.id);
    assert.equal(_post.createdAt, post.created_at);
    assert.equal(_post.updatedAt, post.updated_at);
  });

  await t.test("Find posts by a user", async (t) => {
    t.mock
      .method(postRepositoryMock, "findPostsByUserId")
      .mock.mockImplementationOnce(() => Promise.resolve([post]));

    const posts = await postService.findUserPosts(user.id);

    assert.ok(posts.length > 0);
    assert.equal(posts[0].id, post.id);
    assert.equal(posts[0].createdAt, post.created_at);
    assert.equal(posts[0].updatedAt, post.updated_at);
  });

  await t.test("Create Comment", async (t) => {
    t.mock
      .method(postRepositoryMock, "createComment")
      .mock.mockImplementationOnce(() => Promise.resolve(comment));
    t.mock
      .method(utils, "generateID")
      .mock.mockImplementation(() => comment.id);

    const _comment = await postService.createComment({
      content: post.content,
      userId: user.id,
      postId: post.id,
    });

    assert.ok(_comment);
    assert.equal(_comment.id, comment.id);
    assert.equal(_comment.createdAt, comment.created_at);
    assert.equal(_comment.updatedAt, comment.updated_at);
    assert.equal(_comment.postId, post.id);
    assert.equal(_comment.userId, comment.user_id);
  });
});
