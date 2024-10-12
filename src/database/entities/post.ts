import { BaseEntity } from "./baseEntity";
import { Comment } from "./comment";

export class Post extends BaseEntity {
  id: string;
  title: string;
  content: string;
  userId: string;
  comments?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
