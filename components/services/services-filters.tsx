"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ServicesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function ServicesFilters({
  searchTerm,
  onSearchChange,
}: ServicesFiltersProps) {
  return (
    <Card className="py-2 px-0">
      <CardContent className="py-0 px-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}