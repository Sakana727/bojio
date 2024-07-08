"use client";
import Image from "next/image";
import React from "react";

interface ShareBtnProps {
  title: string;
  text: string;
  url: string;
}

export const ShareBtn = ({ title, text, url }: ShareBtnProps) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        console.log("Post shared successfully");
      } catch (error) {
        console.error("Error sharing post:", error);
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
        className=" cursor-pointer object-contain"
      />
    </button>
  );
};
