import { User, UserRepository } from "src/database";
import { InternalServerError, NotImplementedError } from "src/errors";
import { TopUsersResponse } from "src/types";
import { generateID, mapToTopUsersResponse } from "src/utils";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(
    user: Pick<User, "email" | "name" | "password" | "username">
  ): Promise<User> {
    const _user = await this.userRepository.createUser({
      email: user.email,
      username: user.username,
      id: generateID(),
      name: user.name,
      password: user.password,
    });

    if (!_user) {
      throw new InternalServerError("Error creating user. Try again");
    }

    return User.create(User, {
      id: _user.id,
      email: _user.email,
      username: _user.username,
      name: _user.name,
      password: _user.password,
      createdAt: _user.created_at,
      updatedAt: _user.updated_at,
    });
  }

  async getUsers(): Promise<User[]> {
    const users = await this.userRepository.getUsers();
    return users.map((u) =>
      User.create(User, {
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        password: u.password,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      })
    );
  }

  async getTopUsers(): Promise<TopUsersResponse[]> {
    const topUsers = await this.userRepository.getTopUsers();
    return topUsers.map((t) => mapToTopUsersResponse(t));
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    return User.create(User, {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      password: user.password,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  }
}
