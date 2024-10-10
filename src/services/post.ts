import { PostRepository } from "src/database";

export class PostService {
  constructor(private readonly postRepository: PostRepository) {}
}
