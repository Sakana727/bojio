"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "../ui/textarea";

import { usePathname, useRouter } from "next/navigation";

import { updateUser } from "@/lib/actions/user.actions";
import { PostValidation } from "@/lib/validations/posts";
import { createPost } from "@/lib/actions/post.actions";

import { useOrganization } from "@clerk/nextjs";
import { useToast } from "../ui/use-toast";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

function PostPost({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();
  const { toast } = useToast();

  // Initialize form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      post: "",
      accountId: userId,
    },
  });

  const { control, handleSubmit } = form;
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission status

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof PostValidation>) => {
    setIsSubmitting(true); // Set submitting to true

    try {
      await createPost({
        text: values.post,
        author: userId,
        communityId: organization ? organization.id : null,
        path: pathname,
      });

      form.reset(); // Reset form after submission
      toast({
        title: "Your Post has been posted successfully.",
        description: "Please refresh the page",
      });

      // Navigate to home page after posting
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      router.push("/");
      setIsSubmitting(false); // Set submitting to false
    }
    toast({
      title: "Your Post has been posted successfully.",
      description: "Please refresh the page",
    });
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Content field */}
        <FormField
          control={control}
          name="post"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
        <Button
          type="submit"
          className="bg-primary-500 text-light-1"
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </form>
    </Form>
  );
}

export default PostPost;
