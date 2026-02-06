"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { formatPlatformName, formatServiceType } from "@/lib/validations/wallet";
import { formatCurrency } from "@/lib/wallet/utils";
import { Service } from "./types";
import { TikTokCoinPopup } from "@/components/common/TikTokCoinPopup";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  // Special handling for TikTok coins purchase
  const isTikTokCoins = service.id === "tiktok-coins-hardcoded";
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = () => {
    if (isTikTokCoins) {
      // Show package selection popup
      setShowPopup(true);
    } else {
      // Normal service selection
      onSelect(service);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md gap-3 transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {formatPlatformName(service.platform)}
            </Badge>
            {isTikTokCoins && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                WhatsApp
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">
            {formatServiceType(service.service_type)}
          </CardTitle>
          <CardDescription>
            {service.description || `Get ${formatServiceType(service.service_type).toLowerCase()} for your ${formatPlatformName(service.platform)} content`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={handleClick}
            variant={isTikTokCoins ? "default" : "default"}
          >
            {isTikTokCoins ? (
              <MessageCircle className="mr-2 h-4 w-4" />
            ) : (
              <ShoppingBag className="mr-2 h-4 w-4" />
            )}
            {isTikTokCoins ? "Select Package" : "Order Now"}
          </Button>
        </CardContent>
      </Card>

      {/* Package Selection Popup for TikTok Coins */}
      {isTikTokCoins && (
        <TikTokCoinPopup
          showOnMount={showPopup}
          autoShowDelay={0}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
}