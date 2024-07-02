"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { fetchPollById, voteOnPoll } from "@/lib/actions/poll.actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PollOption {
  _id: string;
  optionText: string;
  votes: number;
}

interface PollData {
  _id: string;
  question: string;
  options: PollOption[];
}

interface PollProps {
  eventId: string;
  pollId: string;
  currentUserId: string;
}

const Poll = ({ eventId, pollId, currentUserId }: PollProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const poll = await fetchPollById(pollId);
        setPollData(poll);
      } catch (error) {
        console.error("Failed to fetch poll data:", error);
      }
    };
    fetchData();
  }, [pollId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOption) {
      setError("You must select an option");
      return;
    }
    try {
      await voteOnPoll({
        pollId,
        optionText: selectedOption,
        userId: currentUserId,
        path: pathname,
      });
      setError(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to submit vote:", error);
      setError("Failed to submit vote");
    }
  };

  if (!pollData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="poll-card">
      <h2 className="poll-question">{pollData.question}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ul className="space-y-2">
          {pollData.options.map((option) => (
            <li key={option._id} className="flex items-center space-x-2">
              <label htmlFor={`option${option._id}`}>{option.optionText}</label>
              <input
                type="radio"
                id={`option${option._id}`}
                name="pollOption"
                value={option.optionText}
                onClick={() => setSelectedOption(option.optionText)}
                className="bg-gray-700 text-white py-2 px-4 rounded cursor-pointer hover:bg-gray-600 transition"
              />
            </li>
          ))}
        </ul>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="community-card_btn">
          Vote
        </button>
      </form>
    </div>
  );
};

export default Poll;
