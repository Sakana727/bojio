"use client";

import { fetchPollById } from "@/lib/actions/poll.actions";
import React, { useEffect, useState } from "react";

interface PollCardProps {
  pollId: string;
}

interface PollOption {
  optionText: string;
  votes: number;
}

interface PollData {
  question: string;
  options: PollOption[];
}

const PollCard: React.FC<PollCardProps> = ({ pollId }) => {
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const data = await fetchPollById(pollId);
        setPollData(data);
        const totalVotes = data.options.reduce(
          (acc: number, option: PollOption) => acc + option.votes,
          0
        );
        setTotalVotes(totalVotes);
      } catch (error) {
        console.error("Error fetching poll data:", error);
      }
    };

    fetchPollData();
  }, [pollId]);

  if (!pollData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="poll-card">
      <h2 className="poll-question">{pollData.question}</h2>
      <ul className="poll-results">
        {pollData.options.map((option) => (
          <li key={option.optionText} className="poll-result">
            <span className="poll-option-text">{option.optionText}</span>
            <span className="poll-option-votes">
              {((option.votes / totalVotes) * 100).toFixed(1)}% ({option.votes}{" "}
              votes)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollCard;
