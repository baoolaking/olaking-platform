"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPlatformName } from "@/lib/validations/wallet";
import { Service } from "./types";

interface PlatformSelectionProps {
  services: Service[];
  onPlatformSelect: (platform: string) => void;
  searchTerm: string;
}

const platformIconMap: Record<string, string> = {
  tiktok: "/images/platforms/tiktok.svg",
  instagram: "/images/platforms/instagram.svg",
  facebook: "/images/platforms/facebook.svg",
  youtube: "/images/platforms/youtube.svg",
  x: "/images/platforms/x.svg",
  telegram: "/images/platforms/telegram.svg",
  whatsapp: "/images/platforms/whatsapp.svg",
};

// All available platforms from the database enum
const ALL_PLATFORMS = [
  "tiktok",
  "instagram",
  "facebook",
  "youtube",
  "x",
  "whatsapp",
  "telegram"
] as const;

export function PlatformSelection({ services, onPlatformSelect, searchTerm }: PlatformSelectionProps) {
  // Create hardcoded TikTok Coins service for counting
  const tiktokCoinsService: Service = {
    id: "tiktok-coins-hardcoded",
    platform: "tiktok",
    service_type: "coins_purchase",
    price_per_1k: 0,
    is_active: true,
    min_quantity: 1,
    max_quantity: 1,
    delivery_time: "Instant",
    description: "Purchase TikTok coins directly through WhatsApp support"
  };

  // Filter platforms based on search term
  const platforms = ALL_PLATFORMS.filter(platform => {
    if (searchTerm) {
      const platformMatches = formatPlatformName(platform).toLowerCase().includes(searchTerm.toLowerCase());
      const hasMatchingServices = services.some(service =>
        service.platform === platform &&
        (formatPlatformName(service.platform).toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.service_type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      // Also check if TikTok coins matches the search for TikTok platform
      const coinsMatches = platform === "tiktok" &&
        ("coins".toLowerCase().includes(searchTerm.toLowerCase()) ||
          "purchase".toLowerCase().includes(searchTerm.toLowerCase()) ||
          "tiktok coins".toLowerCase().includes(searchTerm.toLowerCase()));
      return platformMatches || hasMatchingServices || coinsMatches;
    }
    return true;
  });

  // Count services per platform (including hardcoded TikTok coins)
  const getServiceCount = (platform: string) => {
    const regularServices = services.filter(service => service.platform === platform).length;
    // Add 1 for TikTok coins if it's TikTok platform and matches search
    if (platform === "tiktok") {
      const coinsMatchesSearch = !searchTerm ||
        "coins".toLowerCase().includes(searchTerm.toLowerCase()) ||
        "purchase".toLowerCase().includes(searchTerm.toLowerCase()) ||
        "tiktok coins".toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatPlatformName("tiktok").toLowerCase().includes(searchTerm.toLowerCase());

      return regularServices + (coinsMatchesSearch ? 1 : 0);
    }
    return regularServices;
  };

  if (platforms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No platforms match your search</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Select a platform to view services</p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {platforms.map((platform) => {
          const serviceCount = getServiceCount(platform);
          const platformName = formatPlatformName(platform);

          return (
            <Card
              key={platform}
              className="hover:shadow-md gap-3 py-2 md:py-3 transition-all cursor-pointer hover:scale-105"
              onClick={() => onPlatformSelect(platform)}
            >
              <CardHeader className="text-center pb-2 px-3 pt-4">
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
                    <Image
                      src={platformIconMap[platform] || "/images/platforms/default.svg"}
                      alt={`${platformName} icon`}
                      fill
                      className="object-contain dark:invert"
                    />
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base">{platformName}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0 px-3 pb-4">
                <Badge variant="secondary" className="mb-2 text-xs">
                  {serviceCount} {serviceCount === 1 ? 'Service' : 'Services'}
                </Badge>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Click to view services
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}