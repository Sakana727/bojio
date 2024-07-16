"use client";
import React from "react";
import Image from "next/image";

interface ShareBtnProps {
  title: string;
  text: string;
  EventId: string;
}

export const ShareBtn: React.FC<ShareBtnProps> = ({ title, text, EventId }) => {
  const handleShare = async () => {
    const baseUrl = "https://bojio.vercel.app/event/";
    const url = `${baseUrl}${EventId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        console.log("Event shared successfully");
      } catch (error) {
        console.error("Error sharing Event:", error);
      }
    } else {
      alert("Web Share API is not supported in your browser.");
    }
  };

  return (
    <button onClick={handleShare} className="cursor-pointer">
      <Image
        src="/assets/share.svg"
        alt="share"
        width={24}
        height={24}
        className="cursor-pointer object-contain"
      />
    </button>
  );
};
