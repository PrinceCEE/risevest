import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  username: string;
}

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}
