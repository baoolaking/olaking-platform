"use client";

import { useState } from "react";
import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createService, updateService } from "@/app/admin/services/actions";
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

const SERVICE_TYPES_BY_PLATFORM: Record<string, string[]> = {
  tiktok: ["Followers", "Likes", "Views", "Comments", "Shares", "Hearts"],
  instagram: [
    "Followers",
    "Likes",
    "Views",
    "Comments",
    "Stories Views",
    "Saves",
  ],
  facebook: ["Followers", "Likes", "Views", "Comments", "Shares", "Page Likes"],
  youtube: [
    "Subscribers",
    "Views",
    "Likes",
    "Comments",
    "Watch Time",
    "Shares",
  ],
  x: ["Followers", "Likes", "Retweets", "Comments", "Impressions", "Replies"],
  telegram: ["Members", "Views", "Reactions", "Comments", "Subscribers"],
  whatsapp: ["Followers", "Views"],
};

interface ServiceFormProps {
  service?: Service;
  existingServices?: Service[];
  onSuccess?: () => void;
}

export function ServiceForm({
  service,
  existingServices = [],
  onSuccess,
}: ServiceFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedPlatform, setSelectedPlatform] = useState(
    service?.platform || ""
  );

  // Normalize service type: capitalize first letter to match the options
  const normalizeServiceType = (type: string) => {
    if (!type) return "";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const [selectedServiceType, setSelectedServiceType] = useState(
    service?.service_type ? normalizeServiceType(service.service_type) : ""
  );
  const isEdit = !!service;

  // Get existing service types for the selected platform (excluding current service when editing)
  const existingServiceTypesForPlatform = existingServices
    .filter(
      (s) =>
        s.platform === selectedPlatform && (!isEdit || s.id !== service?.id)
    )
    .map((s) => s.service_type.toLowerCase()); // Normalize to lowercase for comparison

  // Filter out already existing service types, but always include current service type when editing
  const availableServiceTypes = selectedPlatform
    ? (SERVICE_TYPES_BY_PLATFORM[selectedPlatform] || []).filter(
        (type) =>
          !existingServiceTypesForPlatform.includes(type.toLowerCase()) ||
          (isEdit && type.toLowerCase() === service?.service_type.toLowerCase())
      )
    : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("platform", selectedPlatform);
    // Store service type in lowercase in database
    formData.set("service_type", selectedServiceType.toLowerCase());

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateService(service.id, formData);
        } else {
          await createService(formData);
        }
        setOpen(false);
        onSuccess?.();
      } catch (error) {
        console.error("Error:", error);
        alert(
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again."
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Service" : "Add New Service"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the service details"
              : "Add a new service to the platform"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Select
              value={selectedServiceType}
              onValueChange={setSelectedServiceType}
              disabled={!selectedPlatform}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedPlatform
                      ? "Select service type"
                      : "Select a platform first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableServiceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_per_1k">Price per 1K</Label>
            <Input
              id="price_per_1k"
              name="price_per_1k"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              defaultValue={service?.price_per_1k || ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_quantity">Min Quantity</Label>
              <Input
                id="min_quantity"
                name="min_quantity"
                type="number"
                placeholder="10"
                required
                defaultValue={service?.min_quantity || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_quantity">Max Quantity</Label>
              <Input
                id="max_quantity"
                name="max_quantity"
                type="number"
                placeholder="10000"
                required
                defaultValue={service?.max_quantity || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_time">Delivery Time</Label>
            <Input
              id="delivery_time"
              name="delivery_time"
              placeholder="e.g., 1-24 hours"
              defaultValue={service?.delivery_time || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Service description"
              rows={3}
              defaultValue={service?.description || ""}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              name="is_active"
              defaultChecked={service?.is_active || false}
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Active
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedPlatform || !selectedServiceType}
            >
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
