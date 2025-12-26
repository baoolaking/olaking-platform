"use client";

import { useState, useEffect, useMemo } from "react";
import { formatPlatformName, formatServiceType } from "@/lib/validations/wallet";
import { Service } from "@/components/services/types";

export function useServicesFilters(services: Service[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        formatPlatformName(service.platform).toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatServiceType(service.service_type).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by platform
    if (selectedPlatform !== "all") {
      filtered = filtered.filter(service => service.platform === selectedPlatform);
    }

    return filtered;
  }, [services, searchTerm, selectedPlatform]);

  return {
    searchTerm,
    setSearchTerm,
    selectedPlatform,
    setSelectedPlatform,
    filteredServices,
  };
}