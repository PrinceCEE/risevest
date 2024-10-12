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

  async getTopUsers() {}
}
