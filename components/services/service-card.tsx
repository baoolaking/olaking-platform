"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import { formatPlatformName, formatServiceType } from "@/lib/validations/wallet";
import { formatCurrency } from "@/lib/wallet/utils";
import { Service } from "./types";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {formatPlatformName(service.platform)}
          </Badge>
          <Badge variant="outline">
            {formatCurrency(service.price_per_1k)}/1k
          </Badge>
        </div>
        <CardTitle className="text-lg">
          {formatServiceType(service.service_type)}
        </CardTitle>
        <CardDescription>
          {service.description || `Get ${formatServiceType(service.service_type).toLowerCase()} for your ${formatPlatformName(service.platform)} content`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Min Quantity</p>
            <p className="font-medium">{service.min_quantity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max Quantity</p>
            <p className="font-medium">{service.max_quantity.toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Delivery Time</p>
            <p className="font-medium">{service.delivery_time}</p>
          </div>
        </div>
        <Button
          className="w-full"
          onClick={() => onSelect(service)}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Order Now
        </Button>
      </CardContent>
    </Card>
  );
}