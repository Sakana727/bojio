"use client";

import { useState } from "react";
import Image from "next/image";

export const LikeBtnSimple = () => {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked((prevLiked) => !prevLiked); // Toggle liked state
  };

  return (
    <button className="cursor-pointer" onClick={toggleLike}>
      {liked ? (
        <Image
          src="/assets/heart-filled.svg" // The filled heart should represent the liked state
          alt="heart"
          width={24}
          height={24}
          className="cursor-pointer object-contain"
        />
      ) : (
        <Image
          src="/assets/heart-gray.svg" // The gray heart should represent the unliked state
          alt="heart"
          width={24}
          height={24}
          className="cursor-pointer object-contain"
        />
      )}
    </button>
  );
};
