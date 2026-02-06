"use client";

import { useState, useTransition } from "react";
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
import { Plus } from "lucide-react";
import { createTikTokPackage, updateTikTokPackage } from "@/app/admin/tiktok-packages/actions";
import { toast } from "sonner";
import type { TikTokCoinPackage } from "@/types/tiktok-packages";

interface PackageFormProps {
  package_?: TikTokCoinPackage;
  onSuccess?: () => void;
}

export function PackageForm({ package_, onSuccess }: PackageFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!package_;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const coins = parseInt(formData.get("coins") as string);
    const price = parseInt(formData.get("price") as string);
    const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
    const isPopular = formData.get("is_popular") === "on";
    const isActive = formData.get("is_active") === "on";

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateTikTokPackage(package_.id, {
            coins,
            price,
            is_popular: isPopular,
            is_active: isActive,
            sort_order: sortOrder,
          });
          toast.success("Package updated successfully!");
        } else {
          await createTikTokPackage({
            coins,
            price,
            is_popular: isPopular,
            is_active: isActive,
            sort_order: sortOrder,
          });
          toast.success("Package created successfully!");
        }
        setOpen(false);
        onSuccess?.();
      } catch (error) {
        console.error("Error:", error);
        toast.error(
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
            Add Package
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Package" : "Add New Package"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update TikTok coin package details"
              : "Create a new TikTok coin package"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coins">Coins Amount</Label>
            <Input
              id="coins"
              name="coins"
              type="number"
              placeholder="500"
              required
              min="1"
              defaultValue={package_?.coins || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (in Naira)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="10000"
              required
              min="1"
              defaultValue={package_?.price || ""}
            />
            <p className="text-xs text-muted-foreground">
              Display price will be auto-generated (e.g., ₦10,000)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              placeholder="0"
              defaultValue={package_?.sort_order || 0}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_popular"
              name="is_popular"
              defaultChecked={package_?.is_popular || false}
            />
            <Label htmlFor="is_popular" className="font-normal cursor-pointer">
              Mark as Popular (shows "Recent" badge)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              name="is_active"
              defaultChecked={package_?.is_active !== false}
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Active (visible to users)
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
