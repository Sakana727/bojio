"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { EditEventDialog } from "@/components/forms/EditEventDialog";
import DeleteEvent from "../forms/DeleteEvent";
import Image from "next/image";
import { Dialog } from "../ui/dialog";

interface EventDropdownProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  authorId: string;
  communityId: string;
  currentUserId: string;
}

const EventDropdown: React.FC<EventDropdownProps> = ({
  id,
  title,
  description,
  date,
  location,
  image,
  authorId,
  communityId,
  currentUserId,
}) => {
  if (currentUserId !== authorId) return null;
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default">
            <Image
              src="/assets/options.svg"
              alt="heart"
              width={24}
              height={24}
              className="cursor-pointer object-contain"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <EditEventDialog
            eventId={id}
            title={title}
            description={description}
            date={date}
            location={location}
            image={image}
            author={authorId}
            communityId={communityId}
            path={""} // You can set the path as needed
            currentUserId={currentUserId}
          />
          <DeleteEvent
            eventId={id}
            currentUserId={currentUserId}
            authorId={authorId}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  );
};

export default EventDropdown;
