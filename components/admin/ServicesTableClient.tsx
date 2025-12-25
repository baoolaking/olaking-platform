"use client";

import Image from "next/image";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";

interface ServicesTableClientProps {
  services: Array<{
    id: string;
    platform: string;
    service_type: string;
    description: string | null;
    price_per_1k: number;
    min_quantity: number;
    max_quantity: number;
    is_active: boolean;
  }>;
  orderCountMap: Record<string, number>;
}

export function ServicesTableClient({
  services,
  orderCountMap,
}: ServicesTableClientProps) {
  const platformIconMap: Record<string, string> = {
    tiktok: "/images/platforms/tiktok.svg",
    instagram: "/images/platforms/instagram.svg",
    facebook: "/images/platforms/facebook.svg",
    youtube: "/images/platforms/youtube.svg",
    x: "/images/platforms/x.svg",
    twitter: "/images/platforms/x.svg",
    telegram: "/images/platforms/telegram.svg",
  };

  const renderPlatform = (platformRaw: unknown) => {
    const platform = String(platformRaw || "").toLowerCase();
    const iconSrc = platformIconMap[platform];

    return (
      <div className="flex items-center gap-2">
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={`${platform} icon`}
            width={24}
            height={24}
            className="h-6 w-6 dark:invert"
          />
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
            {platform.slice(0, 2) || "?"}
          </span>
        )}
        <span className="font-medium capitalize">{platformRaw as string}</span>
      </div>
    );
  };

  return (
    <ResponsiveTable
      columns={[
        {
          key: "platform",
          label: "Platform",
          render: renderPlatform,
        },
        {
          key: "service_type",
          label: "Service Type",
          render: (type: unknown) => (
            <span className="capitalize">{String(type)}</span>
          ),
        },
        {
          key: "description",
          label: "Description",
          render: (desc: unknown) => (
            <span className="text-sm text-muted-foreground">
              {desc ? String(desc) : "—"}
            </span>
          ),
        },
        {
          key: "price_per_1k",
          label: "Price/1K",
          render: (price: unknown) => (
            <span className="font-medium">
              ₦{Number(price).toLocaleString()}
            </span>
          ),
        },
        {
          key: "min_quantity",
          label: "Min",
          render: (qty: unknown) => Number(qty).toLocaleString(),
        },
        {
          key: "max_quantity",
          label: "Max",
          render: (qty: unknown) => Number(qty).toLocaleString(),
        },
        {
          key: "id",
          label: "Orders",
          render: (serviceId: unknown) => orderCountMap[String(serviceId)] || 0,
        },
        {
          key: "is_active",
          label: "Status",
          render: (isActive: unknown) => (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          ),
        },
      ]}
      data={services}
      keyField="id"
    />
  );
}
