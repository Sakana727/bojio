import * as z from "zod";

export const PostValidation = z.object({
    post: z.string().min(1).min(3, { message: "Minimum 3 characters." }),
    accountId: z.string(),
  });
  
  export const CommentValidation = z.object({
    posts: z.string().min(1).min(3, { message: "Minimum 3 characters." }),
  });