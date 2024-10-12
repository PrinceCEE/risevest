import { NextFunction, Request, Response } from "express";
import { ApiResponse, Application, CommentResponse } from "src/types";
import { CreateCommentDto } from "../dtos";
import { NotFoundError, UnauthorizedError } from "src/errors";
import { mapCommentToCommentResponse } from "src/utils";

export class PostController extends Application {
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const postId = req.params["postId"];
      const data: CreateCommentDto = req.body;

      if (!user) {
        throw new UnauthorizedError();
      }

      const post = await this.config.services.postService.findPostById(postId);
      if (!post) {
        throw new NotFoundError("Post not found");
      }

      const comment = await this.config.services.postService.createComment({
        postId,
        userId: user.id,
        content: data.content,
      });

      const response: ApiResponse<{ comment: CommentResponse }> = {
        success: true,
        message: "Comment added",
        data: { comment: mapCommentToCommentResponse(comment) },
      };
      res.json(response);
    } catch (err: any) {
      next(err);
    }
  };
}
