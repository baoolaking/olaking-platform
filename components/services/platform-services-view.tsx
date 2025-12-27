"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatPlatformName } from "@/lib/validations/wallet";
import { Service } from "./types";
import { ServicesGrid } from "./services-grid";

interface PlatformServicesViewProps {
  platform: string;
  services: Service[];
  onServiceSelect: (service: Service) => void;
  onBack: () => void;
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

export function PlatformServicesView({
  platform,
  services,
  onServiceSelect,
  onBack,
  searchTerm
}: PlatformServicesViewProps) {
  // Create hardcoded TikTok Coins service
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

  // Filter services for this platform
  let platformServices = services.filter(service => service.platform === platform);

  // Add hardcoded TikTok coins service to TikTok platform if it matches search
  if (platform === "tiktok") {
    const coinsMatchesSearch = !searchTerm ||
      "coins".toLowerCase().includes(searchTerm.toLowerCase()) ||
      "purchase".toLowerCase().includes(searchTerm.toLowerCase()) ||
      "tiktok coins".toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatPlatformName("tiktok").toLowerCase().includes(searchTerm.toLowerCase());

    if (coinsMatchesSearch) {
      platformServices = [tiktokCoinsService, ...platformServices];
    }
  }

  // Further filter by search term
  if (searchTerm) {
    platformServices = platformServices.filter(service =>
      formatPlatformName(service.platform).toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  const platformName = formatPlatformName(platform);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Platforms
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative">
            <Image
              src={platformIconMap[platform] || "/images/platforms/default.svg"}
              alt={`${platformName} icon`}
              fill
              className="object-contain dark:invert"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{platformName} Services</h2>
            <p className="text-muted-foreground">
              {platformServices.length} {platformServices.length === 1 ? 'service' : 'services'} available
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <ServicesGrid
        services={platformServices}
        onServiceSelect={onServiceSelect}
      />
    </div>
  );
}