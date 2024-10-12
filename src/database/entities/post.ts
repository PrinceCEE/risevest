import { Comment } from "./comment";

export class Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  comments?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
