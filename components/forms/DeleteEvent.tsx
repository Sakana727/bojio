"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { deleteEvent } from "@/lib/actions/event.actions";

interface Props {
  eventId: string;
  currentUserId: string;
  authorId: string;
}

function DeleteEvent({ eventId, currentUserId, authorId }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (currentUserId !== authorId) return null;

  const handleDelete = async () => {
    await deleteEvent(eventId, pathname);
    router.push("/communities");
  };

  return (
    <Button
      onClick={handleDelete}
      variant="default"
      className="hover:bg-white hover:text-black w-full"
    >
      <Image
        src="/assets/delete.svg"
        alt="delete"
        width={18}
        height={18}
        className="cursor-pointer object-contain inline-block"
      />
      <span className="ml-2">Delete Event</span>
    </Button>
  );
}

export default DeleteEvent;
