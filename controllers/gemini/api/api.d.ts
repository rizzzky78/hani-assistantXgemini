import { Content } from "@google/generative-ai";

export type CreateUserDto = {
  id: string;
  tagname: string;
  content: Content[];
};
export type UpdateUserDto = {
  id: string;
  content: Content[];
};
