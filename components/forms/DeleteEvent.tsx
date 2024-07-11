"use client";

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

  return (
    <Image
      src="/assets/delete.svg"
      alt="delete"
      width={18}
      height={18}
      className="cursor-pointer object-contain"
      onClick={async () => {
        await deleteEvent(eventId, pathname);
        router.push("/communities");
      }}
    />
  );
}

export default DeleteEvent;
