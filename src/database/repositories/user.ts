import { CreateUser } from "src/types";
import { db } from "../connection";

export class UserRepository {
  async findById(id: string) {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await db.query(query, [id]);
    return result[0];
  }

  async findByEmail(email: string) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(query, [email]);
    return result[0];
  }

  async findByUsername(username: string) {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await db.query(query, [username]);
    return result[0];
  }

  async createUser(user: CreateUser) {
    const query = `
      INSERT INTO users (id, name, email, username, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [
      user.id,
      user.name,
      user.email,
      user.username,
      user.password,
    ]);
    return result[0];
  }

  async getUsers() {
    const query = "SELECT * FROM users";
    const result = await db.query(query);
    return result;
  }

  async getTopUsers() {
    const query = `
    WITH top_users AS (
      SELECT user_id, COUNT(*) as post_count
      FROM posts
      GROUP BY user_id
      ORDER BY post_count DESC
      LIMIT 3
    ),
    latest_comments AS (
      SELECT DISTINCT ON (c.user_id)
          c.user_id,
          c.content,
          c.created_at,
          p.title as post_title
      FROM comments c
      JOIN posts p ON c.post_id = p.id
      WHERE c.user_id IN (SELECT user_id FROM top_users)
      ORDER BY c.user_id, c.created_at DESC
    )
    SELECT
        u.id as user_id,
        u.username as username,
        tu.post_count,
        lc.post_title,
        lc.content as latest_comment,
        lc.created_at as comment_created_at
    FROM top_users tu
    JOIN users u ON tu.user_id = u.id
    LEFT JOIN latest_comments lc ON u.id = lc.user_id
    ORDER BY tu.post_count DESC;
    `;

    const result = await db.query(query);
    return result;
  }
}
