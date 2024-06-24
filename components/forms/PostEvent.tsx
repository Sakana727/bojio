"use client";

import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { Textarea } from "../ui/textarea";
import { usePathname, useRouter } from "next/navigation";
import { createEvent } from "@/lib/actions/event.actions";
import { useOrganization } from "@clerk/nextjs";
import { useUploadThing } from "@/lib/uploadthing";
import { EventValidation } from "@/lib/validations/events";

interface Props {
  userId: string;
  btnTitle: string;
}

const EventForm = ({ userId, btnTitle }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("media");
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();

  const form = useForm({
    resolver: zodResolver(EventValidation),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      image: "",
      author: userId,
      communityId: organization ? organization.id : "", // Ensure it defaults to an empty string if organization is not available
    },
  });

  // Handle image selection and preview
  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof EventValidation>) => {
    const blob = values.image;
    const hasImageChanged =
      typeof blob === "string" && blob.startsWith("data:image");

    // If the image has changed, upload it
    if (hasImageChanged) {
      const imgRes = await startUpload(files);
      if (imgRes && Array.isArray(imgRes) && imgRes.length > 0) {
        const fileUrl = imgRes[0].url; // Adjust this based on your upload response structure
        if (fileUrl) {
          values.image = fileUrl;
        }
      }
    }

    // Prepare event data for submission
    const eventData = {
      title: values.title,
      description: values.description,
      date: values.date,
      location: values.location,
      image: values.image || "", // Ensure it defaults to an empty string if undefined
      author: userId,
      communityId: values.communityId || "", // Ensure it defaults to null if undefined
      parentId: undefined,
      path: pathname,
    };

    // Call the createEvent action to create the event
    await createEvent(eventData);

    // Redirect to home page after event creation
    router.push("/");
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Title field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3 text-white">
              <FormLabel className="text-base-semibold text-light-2">
                Title
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3 text-white">
              <FormLabel className="text-base-semibold text-light-2">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3 text-white">
              <FormLabel className="text-base-semibold text-light-2">
                Date
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location field */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3 text-white">
              <FormLabel className="text-base-semibold text-light-2">
                Location
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image upload field */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="event-form_image-label">
                {field.value ? (
                  <Image
                    src={field.value}
                    alt="event_image"
                    width={96}
                    height={96}
                    priority
                    className="rounded object-contain"
                  />
                ) : (
                  <Image
                    src="/assets/default-event-image.svg"
                    alt="event_image"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input
                  type="file"
                  accept="image/*"
                  placeholder="Add event image"
                  className="account-form_image-input"
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
        <Button type="submit" className="bg-primary-500 text-white">
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
