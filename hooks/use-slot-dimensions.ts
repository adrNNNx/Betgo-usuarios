// hooks/use-slot-dimensions.ts
"use client";

import { useEffect, useState } from "react";

interface SlotDimensions {
  symbolHeight: number;
  symbolWidth: number;
  reelGap: number;
  emojiSize: string;
  imgSize: string;
}

/**
 * Custom hook to handle responsive dimensions for the slot machine
 * Adjusts sizes based on screen width for optimal display
 */
export function useSlotDimensions(): SlotDimensions {
  const [dims, setDims] = useState<SlotDimensions>({
    symbolHeight: 80,
    symbolWidth: 80,
    reelGap: 8,
    emojiSize: "text-4xl",
    imgSize: "w-12 h-12",
  });

  useEffect(() => {
    function updateDimensions() {
      const width = window.innerWidth;

      if (width < 640) {
        // Mobile
        setDims({
          symbolHeight: 60,
          symbolWidth: 55,
          reelGap: 4,
          emojiSize: "text-3xl",
          imgSize: "w-10 h-10",
        });
      } else if (width < 1024) {
        // Tablet
        setDims({
          symbolHeight: 75,
          symbolWidth: 70,
          reelGap: 6,
          emojiSize: "text-4xl",
          imgSize: "w-12 h-12",
        });
      } else {
        // Desktop
        setDims({
          symbolHeight: 90,
          symbolWidth: 85,
          reelGap: 8,
          emojiSize: "text-5xl",
          imgSize: "w-14 h-14",
        });
      }
    }

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return dims;
}
