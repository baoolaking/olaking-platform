"use client";

import { ServiceCard } from "./service-card";
import { Service } from "./types";

interface ServicesGridProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
}

export function ServicesGrid({ services, onServiceSelect }: ServicesGridProps) {
  if (services.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">No services found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onSelect={onServiceSelect}
        />
      ))}
    </div>
  );
}