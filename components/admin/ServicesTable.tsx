"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { ServiceForm } from "./ServiceForm";
import { DeleteServiceButton } from "./DeleteServiceButton";
import Image from "next/image";
import { Tables } from "@/types/database";

type Service = Tables<"services">;

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
];

const platformIconMap: Record<string, string> = {
  tiktok: "/images/platforms/tiktok.svg",
  instagram: "/images/platforms/instagram.svg",
  facebook: "/images/platforms/facebook.svg",
  youtube: "/images/platforms/youtube.svg",
  x: "/images/platforms/x.svg",
  twitter: "/images/platforms/x.svg",
  telegram: "/images/platforms/telegram.svg",
  whatsapp: "/images/platforms/whatsapp.svg",
};

interface ServicesTableProps {
  services: Service[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all-platforms");
  const [statusFilter, setStatusFilter] = useState<string>("all-status");

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.service_type
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPlatform =
      platformFilter === "all-platforms" || service.platform === platformFilter;
    const matchesStatus =
      statusFilter === "all-status" ||
      (statusFilter === "active" ? service.is_active : !service.is_active);

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const renderPlatform = (platformRaw: unknown) => {
    const platform = String(platformRaw || "").toLowerCase();
    const icon = platformIconMap[platform];

    return (
      <div className="flex items-center gap-2">
        {icon ? (
          <Image
            src={icon}
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Search</label>
          <Input
            placeholder="Search by service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <label className="text-sm font-medium mb-1 block">Platform</label>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-platforms">All Platforms</SelectItem>
              {PLATFORMS.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
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
            key: "pricing",
            label: "Pricing/1K",
            render: (_: unknown, row: Service) => (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">High:</span>
                  <span className="font-medium text-sm">
                    ₦{Number(row.high_quality_price_per_1k || row.price_per_1k).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Low:</span>
                  <span className="font-medium text-sm">
                    ₦{Number(row.low_quality_price_per_1k || row.price_per_1k * 0.7).toLocaleString()}
                  </span>
                </div>
              </div>
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
            key: "delivery_time",
            label: "Delivery",
            render: (time: unknown) => (
              <span className="text-sm text-muted-foreground">
                {String(time) || "—"}
              </span>
            ),
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
          {
            key: "actions",
            label: "Actions",
            render: (_: unknown, row: Service) => (
              <div className="flex gap-2">
                <ServiceForm service={row} existingServices={services} />
                <DeleteServiceButton
                  id={row.id}
                  serviceName={row.service_type}
                />
              </div>
            ),
          },
        ]}
        data={filteredServices}
        keyField="id"
        getMobileTitle={(row) => (
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">{row.platform}</span>
            <span className="text-muted-foreground">-</span>
            <span className="capitalize">{row.service_type}</span>
            <span className="text-muted-foreground">-</span>
            <span className="font-semibold">
              H: ₦{Number(row.high_quality_price_per_1k || row.price_per_1k).toLocaleString()} /
              L: ₦{Number(row.low_quality_price_per_1k || row.price_per_1k * 0.7).toLocaleString()}
            </span>
          </div>
        )}
      />
      {filteredServices.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No services found</p>
        </div>
      )}
    </div>
  );
}
