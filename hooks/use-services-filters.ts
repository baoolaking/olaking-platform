"use client";

import { useState } from "react";

export function useServicesFilters() {
  const [searchTerm, setSearchTerm] = useState("");

  return {
    searchTerm,
    setSearchTerm,
  };
}