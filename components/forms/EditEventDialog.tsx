"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEvent } from "@/lib/actions/event.actions";
import { toast } from "../ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

interface EditEventDialogProps {
  eventId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  author: string;
  communityId: string;
  path: string;
  currentUserId: string;
}

export const EditEventDialog: React.FC<EditEventDialogProps> = ({
  eventId,
  title,
  description,
  date,
  location,
  image,
  author,
  communityId,
  path,
  currentUserId,
}) => {
  const [open, setOpen] = React.useState(false);
  const [eventTitle, setEventTitle] = React.useState(title);
  const [eventDescription, setEventDescription] = React.useState(description);
  const [eventDate, setEventDate] = React.useState(date);
  const [eventLocation, setEventLocation] = React.useState(location);
  const [eventImage, setEventImage] = React.useState(image); // State for edited image URL
  const [files, setFiles] = useState<File[]>([]); // State for file upload
  const { startUpload } = useUploadThing("media"); // Upload hook
  const router = useRouter();
  const pathname = usePathname();
  if (currentUserId !== author) return null;

  // Handle image selection and preview
  const handleImageChange = (
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
        setEventImage(imageDataUrl); // Update local state with new image data URL
        fieldChange(imageDataUrl); // Update form state if needed
      };

      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Submitting update with path:", path);

      // Upload new image if changed
      if (eventImage !== image) {
        const imgRes = await startUpload(files);
        if (imgRes && Array.isArray(imgRes) && imgRes.length > 0) {
          const fileUrl = imgRes[0].url;
          if (fileUrl) {
            setEventImage(fileUrl);
          }
        }
      }

      await updateEvent({
        eventId,
        title: eventTitle,
        description: eventDescription,
        date: eventDate,
        location: eventLocation,
        image: eventImage, // Use updated image URL
        author,
        communityId,
        path: pathname,
      });

      setOpen(false); // Close dialog on successful submission
      toast({
        title: "Event updated successfully",
        description: "Please refresh the page",
      }); // Show success toast
      router.replace(pathname); // Navigate to the same path to refresh content
    } catch (error: any) {
      console.error("Failed to update the event:", error.message);
      toast({
        title: "Failed to update event",
        description: "Please refresh the page",
      }); // Show error toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className=" hover:bg-white hover:text-black w-full">
          <Image
            src="/assets/create.svg"
            alt="heart"
            width={24}
            height={24}
            className="cursor-pointer object-contain mx-2 bg-black"
          />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
                className="account-form_input"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                required
                className="account-form_input"
              />
            </div>
            <div>
              <Label htmlFor="datetime">Date</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="account-form_input"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                required
                className="account-form_input"
              />
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setEventImage)}
                className="account-form_image-input"
              />
              {eventImage && (
                <Image
                  src={eventImage}
                  alt="Event Image"
                  width={200}
                  height={100}
                  className="mt-2 rounded"
                />
              )}
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
