"use client";

import {
  addParticipantToEvent,
  fetchParticipants,
} from "@/lib/actions/event.actions";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  eventId: string;
  userId: string;
}

const BojioButton = ({ eventId, userId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const fetchedParticipants = await fetchParticipants(eventId);
        setParticipants(fetchedParticipants);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Submitting with eventId:", eventId, "and userId:", userId);
    try {
      await addParticipantToEvent(eventId, userId, pathname);
      const updatedParticipants = await fetchParticipants(eventId);
      setParticipants(updatedParticipants);
    } catch (error) {
      console.error("Failed to add participant:", error);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      className="flex items-center space-x-1 bg-transparent border-none"
    >
      <Image
        src="/assets/logo.svg"
        alt="bojio"
        width={24}
        height={24}
        className="cursor-pointer object-contain"
      />
    </button>
  );
};

export default BojioButton;
