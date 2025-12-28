"use client";

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

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  // Special handling for TikTok coins purchase
  const isTikTokCoins = service.id === "tiktok-coins-hardcoded";

  const handleClick = () => {
    if (isTikTokCoins) {
      // Create WhatsApp link for TikTok coins purchase
      const whatsappNumber1 = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_1;
      const whatsappNumber2 = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2;
      const defaultNumber = whatsappNumber1 || whatsappNumber2 || "+2349017992518";

      const message = encodeURIComponent(
        "Hi! I'm interested in purchasing TikTok coins. Can you help me with the available packages and pricing?"
      );
      const whatsappUrl = `https://wa.me/${defaultNumber.replace('+', '')}?text=${message}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
    } else {
      // Normal service selection
      onSelect(service);
    }
  };

  return (
    <Card className="hover:shadow-md gap-3 transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {formatPlatformName(service.platform)}
          </Badge>
          {!isTikTokCoins && (
            <div className="flex flex-col gap-1">
              <Badge variant="outline" className="text-xs">
                H: {formatCurrency(service.high_quality_price_per_1k || service.price_per_1k)}/1k
              </Badge>
              <Badge variant="outline" className="text-xs">
                L: {formatCurrency(service.low_quality_price_per_1k || service.price_per_1k * 0.7)}/1k
              </Badge>
            </div>
          )}
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
          {isTikTokCoins ? "Contact via WhatsApp" : "Order Now"}
        </Button>
      </CardContent>
    </Card>
  );
}