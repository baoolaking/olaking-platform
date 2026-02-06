"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPlatformName, formatServiceType } from "@/lib/validations/wallet";
import { Service } from "./types";
import { ServicesGrid } from "./services-grid";

interface PlatformTabsProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
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

export function PlatformTabs({ services, onServiceSelect, searchTerm }: PlatformTabsProps) {
  // Create hardcoded TikTok Coins service
  const tiktokCoinsService: Service = {
    id: "tiktok-coins-hardcoded",
    platform: "tiktok",
    service_type: "coins_purchase",
    price_per_1k: 0, // Not used for this special service
    is_active: true,
    min_quantity: 1,
    max_quantity: 1,
    delivery_time: "Instant",
    description: "Packages: 200 (₦4k), 500 (₦10k), 1000 (₦20k), 1500 (₦30k), 5000 (₦100k), 10000 (₦200k). Save 25% with lower service fee."
  };

  // Show all platforms from enum, not just those with services
  const platforms = ALL_PLATFORMS.filter(platform => {
    // If there's a search term, filter platforms that match or have matching services
    if (searchTerm) {
      const platformMatches = formatPlatformName(platform).toLowerCase().includes(searchTerm.toLowerCase());
      const hasMatchingServices = services.some(service =>
        service.platform === platform &&
        (formatPlatformName(service.platform).toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatServiceType(service.service_type).toLowerCase().includes(searchTerm.toLowerCase()))
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

  // Filter services by search term
  const filteredServices = services.filter(service =>
    formatPlatformName(service.platform).toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatServiceType(service.service_type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group services by platform (including empty arrays for platforms with no services)
  const servicesByPlatform = platforms.reduce((acc, platform) => {
    acc[platform] = filteredServices.filter(service => service.platform === platform);

    // Add hardcoded TikTok coins service to TikTok platform if it matches search
    if (platform === "tiktok") {
      const coinsMatchesSearch = !searchTerm ||
        "coins".toLowerCase().includes(searchTerm.toLowerCase()) ||
        "purchase".toLowerCase().includes(searchTerm.toLowerCase()) ||
        "tiktok coins".toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatPlatformName("tiktok").toLowerCase().includes(searchTerm.toLowerCase());

      if (coinsMatchesSearch) {
        acc[platform] = [tiktokCoinsService, ...acc[platform]];
      }
    }

    return acc;
  }, {} as Record<string, Service[]>);

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
        <p className="text-sm text-muted-foreground">Select the service of your choice</p>
      </div>

      <Tabs defaultValue={platforms[0] || ""} className="w-full">
        <TabsList className="flex w-full justify-center gap-1 sm:gap-2 lg:gap-4 mb-6 h-auto p-1 flex-wrap">
          {platforms.map((platform) => {
            const iconSrc = platformIconMap[platform];
            return (
              <TabsTrigger
                key={platform}
                value={platform}
                className="flex items-center justify-center gap-1 lg:gap-3 px-2 sm:px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm min-h-[40px] lg:min-h-[48px] flex-shrink-0"
              >
                {/* Mobile: Icon only */}
                <div className="sm:hidden flex items-center justify-center">
                  {iconSrc && (
                    <Image
                      src={iconSrc}
                      alt={`${platform} icon`}
                      width={18}
                      height={18}
                      className="dark:invert"
                    />
                  )}
                </div>

                {/* Desktop: Icon + Text + Count */}
                <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                  {iconSrc && (
                    <Image
                      src={iconSrc}
                      alt={`${platform} icon`}
                      width={18}
                      height={18}
                      className="dark:invert"
                    />
                  )}
                  <span className="whitespace-nowrap">{formatPlatformName(platform)}</span>
                  <span className="text-xs opacity-70">({servicesByPlatform[platform].length})</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {platforms.map((platform) => (
          <TabsContent key={platform} value={platform}>
            {servicesByPlatform[platform].length > 0 ? (
              <ServicesGrid
                services={servicesByPlatform[platform]}
                onServiceSelect={onServiceSelect}
              />
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  {platformIconMap[platform] && (
                    <Image
                      src={platformIconMap[platform]}
                      alt={`${platform} icon`}
                      width={48}
                      height={48}
                      className="dark:invert opacity-50"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      No {formatPlatformName(platform)} Services Available
                    </h3>
                    <p className="text-muted-foreground">
                      Services for {formatPlatformName(platform)} are coming soon.
                      <br />
                      Contact support for more information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}