import { BaseEntity } from "./baseEntity";

export class Comment extends BaseEntity {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
}
