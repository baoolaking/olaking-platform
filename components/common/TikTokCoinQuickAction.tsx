"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { TikTokCoinPopup } from "./TikTokCoinPopup";

interface TikTokCoinQuickActionProps {
  whatsappNumber?: string;
}

export function TikTokCoinQuickAction({ whatsappNumber }: TikTokCoinQuickActionProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden border-pink-200 dark:border-pink-800 bg-card">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 to-purple-50/80 dark:from-pink-950/10 dark:to-purple-950/10" />

        {/* Content */}
        <div className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Image
                src="/images/tiktok-coin.png"
                alt="TikTok Coin"
                width={24}
                height={24}
                className="rounded"
              />
              <CardTitle className="text-lg">TikTok Coins</CardTitle>
            </div>
            <CardDescription>
              From 200 coins (₦4,000) to 10,000 coins (₦200,000) • Save 25%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              onClick={() => setShowPopup(true)}
            >
              Select Package
            </Button>
          </CardContent>
        </div>
      </Card>

      {/* Package Selection Popup */}
      <TikTokCoinPopup
        showOnMount={showPopup}
        autoShowDelay={0}
        whatsappNumber={whatsappNumber}
        onClose={() => setShowPopup(false)}
      />
    </>
  );
}