import { Post } from "./post";

export class User {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  posts?: Post[];
  createdAt: Date;
  updatedAt: Date;
}
