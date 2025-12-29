"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { getTikTokCoinsWhatsAppUrl, TIKTOK_COINS_CONFIG } from "@/lib/config/tiktok-coins";

interface TikTokCoinPopupProps {
  showOnMount?: boolean;
  autoShowDelay?: number;
  whatsappNumber?: string;
  onClose?: () => void;
}

export function TikTokCoinPopup({
  showOnMount = false,
  autoShowDelay = TIKTOK_COINS_CONFIG.popup.autoShowDelay,
  whatsappNumber,
  onClose
}: TikTokCoinPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (showOnMount) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, autoShowDelay);

      return () => clearTimeout(timer);
    }
  }, [showOnMount, autoShowDelay]);

  const handleWhatsAppClick = () => {
    const whatsappUrl = getTikTokCoinsWhatsAppUrl(whatsappNumber);
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
    onClose?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-w-[90vw] mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Image
              src="/images/tiktok-coin.png"
              alt="TikTok Coin"
              width={28}
              height={28}
              className="rounded sm:w-8 sm:h-8"
            />
            Get TikTok Coins Now!
          </DialogTitle>
          <DialogDescription className="text-sm">
            No registration required! Contact us directly on WhatsApp for instant TikTok coin purchases.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-3 sm:space-y-4 py-3 sm:py-4">
          <Image
            src="/images/tiktok-coin.png"
            alt="TikTok Coin"
            width={64}
            height={64}
            className="rounded-lg sm:w-20 sm:h-20"
          />

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-base sm:text-lg">💰 Best Rates Available</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              ✅ No login details needed<br />
              ✅ No email or phone verification<br />
              ✅ Instant delivery via WhatsApp<br />
              ✅ 24/7 support & secure transactions
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Contact Us on WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full text-sm sm:text-base"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}