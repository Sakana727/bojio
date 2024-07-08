"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchParticipants } from "@/lib/actions/event.actions";

interface Props {
  eventId: string;
}

interface Participant {
  id: string;
  username: string;
  name: string;
  image: string;
  bio: string;
}

const BojioCard = ({ eventId }: Props) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const fetchedParticipants = await fetchParticipants(eventId);
        setParticipants(fetchedParticipants);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
      }
    };

    loadParticipants();
  }, [eventId]);

  return (
    <div className="ml-1 mt-3 text-white poll-card">
      <h2 className="text-lg font-semibold">
        Participants ({participants.length})
      </h2>
      <ul className="mt-4 space-y-2">
        {participants.map((participant) => (
          <li key={participant.id} className="flex items-center space-x-2">
            <div className="participant-image-container">
              <Image
                src={participant.image || "/assets/default-avatar.png"}
                alt={`${participant.name}'s Avatar`}
                width={54}
                height={54}
                className="participant-image"
              />
            </div>
            <div>
              <p className="text-subtle-medium text-gray-1">
                {participant.name} (@{participant.username})
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BojioCard;
