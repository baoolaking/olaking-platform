"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { formatPlatformName } from "@/lib/validations/wallet";
import { Service } from "./types";

interface ServicesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPlatform: string;
  onPlatformChange: (value: string) => void;
  services: Service[];
}

export function ServicesFilters({
  searchTerm,
  onSearchChange,
  selectedPlatform,
  onPlatformChange,
  services,
}: ServicesFiltersProps) {
  const getUniquePlatforms = () => {
    const platforms = [...new Set(services.map(service => service.platform))];
    return platforms.sort();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select
              value={selectedPlatform}
              onValueChange={onPlatformChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Platforms</SelectItem>
                {getUniquePlatforms().map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {formatPlatformName(platform)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}