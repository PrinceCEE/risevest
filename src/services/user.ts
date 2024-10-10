import { UserRepository } from "src/database";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
}
