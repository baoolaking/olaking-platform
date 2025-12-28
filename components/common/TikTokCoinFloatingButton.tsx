"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TikTokCoinPopup } from "./TikTokCoinPopup";
import Image from "next/image";

interface TikTokCoinFloatingButtonProps {
  whatsappNumber?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function TikTokCoinFloatingButton({
  whatsappNumber,
  position = "bottom-right"
}: TikTokCoinFloatingButtonProps) {
  const [showPopup, setShowPopup] = useState(false);

  const positionClasses = {
    "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6",
    "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6",
    "top-right": "top-4 right-4 sm:top-6 sm:right-6",
    "top-left": "top-4 left-4 sm:top-6 sm:left-6"
  };

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button
          onClick={handleOpenPopup}
          size="lg"
          className="rounded-full h-12 w-12 sm:h-16 sm:w-16 p-0 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
        >
          <Image
            src="/images/tiktok-coin.png"
            alt="TikTok Coin"
            width={24}
            height={24}
            className="rounded sm:w-8 sm:h-8"
          />
        </Button>
      </div>

      {/* Single popup instance controlled by state */}
      {showPopup && (
        <TikTokCoinPopup
          showOnMount={true}
          autoShowDelay={0}
          whatsappNumber={whatsappNumber}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
}