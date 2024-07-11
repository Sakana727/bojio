"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { usePathname, useRouter } from "next/navigation";
import { createPoll } from "@/lib/actions/poll.actions";
import { PollValidation } from "@/lib/validations/poll";
import { useToast } from "../ui/use-toast";

// Define the interface for component props
interface PostPollProps {
  userId: string;
  eventId: string;
}

// PostPoll component definition
function PostPoll({ userId, eventId }: PostPollProps) {
  const router = useRouter(); // Router instance for navigation
  const pathname = usePathname(); // Get current pathname
  const { toast } = useToast();

  // Initialize form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(PollValidation),
    defaultValues: {
      question: "",
      options: ["", ""], // Default to two empty options
    },
  });

  const { control, handleSubmit, setValue, getValues } = form;
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission status

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof PollValidation>) => {
    setIsSubmitting(true); // Set submitting to true

    const filteredOptions = values.options.filter(
      (opt: string) => opt.trim() !== "" // Filter out empty options
    );

    // Create a new poll
    await createPoll({
      question: values.question,
      options: filteredOptions,
      eventId: eventId,
      path: pathname,
    });

    toast({
      title: "Your Poll has been posted successfully.",
      description: "Please refresh the page",
    });

    form.reset(); // Reset form after submission
    router.push("/communities"); // Navigate to communities page
  };

  // Add a new option to the poll
  const addOption = () => {
    const currentOptions = getValues("options") as string[];
    setValue("options", [...currentOptions, ""]);
  };

  // Remove an option from the poll
  const removeOption = (index: number) => {
    const currentOptions = getValues("options") as string[];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    setValue("options", newOptions);
  };

  return (
    <Form {...form}>
      <form
        className=" my-2 flex flex-col justify-start gap-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Question field */}
        <FormField
          control={control}
          name="question"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Question
              </FormLabel>
              <FormControl>
                <Input className="account-form_input no-focus" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Options field */}
        <FormField
          control={control}
          name="options"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Options
              </FormLabel>
              {field.value.map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <FormControl>
                    <Input
                      className="account-form_input no-focus"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...field.value];
                        newOptions[index] = e.target.value;
                        setValue("options", newOptions);
                      }}
                    />
                  </FormControl>
                  <Button
                    className="bg-primary-500 text-light-1"
                    type="button"
                    onClick={() => removeOption(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={addOption}
                className="bg-slate-800 text-light-1"
              >
                Add Option
              </Button>
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
          {isSubmitting ? "Submitting..." : "Create Poll"}
        </Button>
      </form>
    </Form>
  );
}

export default PostPoll;
