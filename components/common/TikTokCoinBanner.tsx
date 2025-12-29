"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { getTikTokCoinsWhatsAppUrl } from "@/lib/config/tiktok-coins";

interface TikTokCoinBannerProps {
  whatsappNumber?: string;
  className?: string;
}

export function TikTokCoinBanner({
  whatsappNumber,
  className = ""
}: TikTokCoinBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleWhatsAppClick = () => {
    const whatsappUrl = getTikTokCoinsWhatsAppUrl(whatsappNumber);
    window.open(whatsappUrl, "_blank");
  };

  if (!isVisible) return null;

  return (
    <Card className={`relative bg-gradient-to-r from-pink-500 to-purple-600 text-white ${className}`}>
      <CardContent className="p-3 sm:p-4">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 sm:gap-4 pr-8">
          <Image
            src="/images/tiktok-coin.png"
            alt="TikTok Coin"
            width={40}
            height={40}
            className="rounded-lg sm:w-12 sm:h-12 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg leading-tight">
              🚀 Get TikTok Coins - No Login Required!
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-tight">
              Direct WhatsApp contact • Best rates • Instant delivery
            </p>
          </div>

          <Button
            onClick={handleWhatsAppClick}
            variant="secondary"
            size="sm"
            className="bg-white text-purple-600 hover:bg-white/90 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-shrink-0"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden xs:inline">Buy Now</span>
            <span className="xs:hidden">Buy</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}