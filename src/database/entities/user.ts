import { BaseEntity } from "./baseEntity";
import { Post } from "./post";

export class User extends BaseEntity {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  posts?: Post[];
  createdAt: Date;
  updatedAt: Date;
}
