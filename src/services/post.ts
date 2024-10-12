import { Comment, Post, PostRepository } from "src/database";
import { InternalServerError, NotFoundError } from "src/errors";
import { generateID } from "src/utils";

export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(
    post: Pick<Post, "content" | "title" | "userId">
  ): Promise<Post> {
    const _post = await this.postRepository.createPost({
      content: post.content,
      id: generateID(),
      title: post.title,
      userId: post.userId,
    });

    if (!_post) {
      throw new InternalServerError("Error creating post. Try again");
    }

    return Post.create(Post, {
      id: _post.id,
      content: _post.content,
      title: _post.title,
      userId: _post.user_id,
      createdAt: _post.created_at,
      updatedAt: _post.updated_at,
    });
  }

  async findPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findPostById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return Post.create(Post, {
      id: post.id,
      content: post.content,
      title: post.title,
      userId: post.userId,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    });
  }

  async findUserPosts(userId: string): Promise<Post[]> {
    const posts = await this.postRepository.findPostsByUserId(userId);
    return posts.map((p) =>
      Post.create(Post, {
        id: p.id,
        content: p.content,
        title: p.title,
        userId: p.userId,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })
    );
  }

  async createComment(
    comment: Pick<Comment, "content" | "postId" | "userId">
  ): Promise<Comment> {
    const _comment = await this.postRepository.createComment({
      content: comment.content,
      id: generateID(),
      postId: comment.postId,
      userId: comment.userId,
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    return Comment.create(Comment, {
      id: _comment.id,
      content: _comment.content,
      userId: _comment.user_id,
      postId: _comment.post_id,
      createdAt: _comment.created_at,
      updatedAt: _comment.updated_at,
    });
  }
}
