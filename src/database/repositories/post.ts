import { CreateComment, CreatePost } from "src/types";
import { db } from "../connection";

export class PostRepository {
  async createPost(post: CreatePost) {
    const query = `
      INSERT INTO posts (id, title, content, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [
      post.id,
      post.title,
      post.content,
      post.userId,
    ]);
    return result[0];
  }

  async createComment(comment: CreateComment) {
    const query = `
    INSERT INTO comments (id, content, user_id, post_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
    const result = await db.query(query, [
      comment.id,
      comment.content,
      comment.userId,
      comment.postId,
    ]);
    return result[0];
  }

  async findPostById(id: string) {
    const query = "SELECT * from posts WHERE id = $1";
    const result = await db.query(query, [id]);
    return result[0];
  }

  async findPostsByUserId(userId: string) {
    const query = "SELECT * from posts WHERE user_id = $1";
    const result = await db.query(query, [userId]);
    return result;
  }

  async findCommendById(id: string) {
    const query = "SELECT * from comments WHERE id = $1";
    const result = await db.query(query, [id]);
    return result[0];
  }
}
