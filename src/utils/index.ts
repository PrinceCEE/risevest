import { compare, genSalt, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { Comment, Post, User } from "src/database";
import { UnauthorizedError } from "src/errors";
import { PostResponse, TopUsersResponse, UserResponse } from "src/types";

export const hashPassword = async (pwd: string) => {
  const salt = await genSalt(10);
  return hash(pwd, salt);
};

export const comparePassword = (pwdHash: string, pwd: string) => {
  return compare(pwd, pwdHash);
};

export const generateAccessToken = async (data: { sub: string }) => {
  return sign(data, process.env.JWT_SECRET!, { expiresIn: "3d" });
};

export const verifyToken = async (token: string) => {
  try {
    return verify(token, process.env.JWT_SECRET!);
  } catch (err: any) {
    throw new UnauthorizedError(err.message);
  }
};

export const mapUserToUserResponse = (user: User): UserResponse => {
  const { password, ..._user } = user;
  return _user;
};

export const mapPostToPostResponse = (post: Post): PostResponse => {
  return post;
};

export const mapCommentToCommentResponse = (comment: Comment) => {
  return comment;
};

export const mapToTopUsersResponse = (data: any): TopUsersResponse => {
  return {
    userId: data.user_id,
    username: data.username,
    postCount: data.post_count,
    postTitle: data.post_title,
    latestComment: data.latest_comment,
    commentCreatedAt: data.comment_created_at,
  };
};

export const generateID = () => uuid();
