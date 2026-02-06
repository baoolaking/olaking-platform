"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, Eye, EyeOff, Loader2 } from "lucide-react";
import { PackageForm } from "./PackageForm";
import {
  deleteTikTokPackage,
  togglePackageStatus,
  togglePackagePopular,
} from "@/app/admin/tiktok-packages/actions";
import { toast } from "sonner";
import type { TikTokCoinPackage } from "@/types/tiktok-packages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PackagesTableProps {
  packages: TikTokCoinPackage[];
  onUpdate: () => void;
  userRole?: string;
}

export function PackagesTable({ packages, onUpdate, userRole }: PackagesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingPopularId, setTogglingPopularId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const isSuperAdmin = userRole === "super_admin";

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTikTokPackage(id);
      toast.success("Package deleted successfully!");
      onUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete package"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setTogglingStatusId(id);
    try {
      await togglePackageStatus(id, !currentStatus);
      toast.success(
        `Package ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
      onUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update package status");
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleTogglePopular = async (id: string, currentStatus: boolean) => {
    setTogglingPopularId(id);
    try {
      await togglePackagePopular(id, !currentStatus);
      toast.success(
        `Package ${!currentStatus ? "marked as popular" : "unmarked"} successfully!`
      );
      onUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update package");
    } finally {
      setTogglingPopularId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coins</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Display Price</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Popular</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No packages found. Create your first package to get started.
              </TableCell>
            </TableRow>
          ) : (
            packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.coins}</TableCell>
                <TableCell>₦{pkg.price.toLocaleString()}</TableCell>
                <TableCell>{pkg.display_price}</TableCell>
                <TableCell>{pkg.sort_order}</TableCell>
                <TableCell>
                  <Badge variant={pkg.is_active ? "default" : "secondary"}>
                    {pkg.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pkg.is_popular && (
                    <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(pkg.id, pkg.is_active)}
                      title={pkg.is_active ? "Deactivate" : "Activate"}
                      disabled={togglingStatusId === pkg.id}
                    >
                      {togglingStatusId === pkg.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : pkg.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePopular(pkg.id, pkg.is_popular)}
                      title={pkg.is_popular ? "Remove popular" : "Mark as popular"}
                      disabled={togglingPopularId === pkg.id}
                    >
                      {togglingPopularId === pkg.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star
                          className={`w-4 h-4 ${pkg.is_popular ? "fill-yellow-400 text-yellow-400" : ""
                            }`}
                        />
                      )}
                    </Button>
                    <PackageForm package_={pkg} onSuccess={onUpdate} />
                    {isSuperAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === pkg.id}
                          >
                            {deletingId === pkg.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-destructive" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the {pkg.coins} coins
                              package? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(pkg.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table >
    </div >
  );
}
