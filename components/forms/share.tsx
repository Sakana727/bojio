"use client";
import React from "react";
import Image from "next/image";

interface ShareBtnProps {
  title: string;
  text: string;
  postId: string;
}

export const ShareBtn: React.FC<ShareBtnProps> = ({ title, text, postId }) => {
  const handleShare = async () => {
    const baseUrl = "http://localhost:3000/post/";
    const url = `${baseUrl}${postId}`;

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
        className="cursor-pointer object-contain"
      />
    </button>
  );
};
