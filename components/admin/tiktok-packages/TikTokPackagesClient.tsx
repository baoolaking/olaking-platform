"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { PackagesTable } from "./PackagesTable";
import { PackageForm } from "./PackageForm";
import { getTikTokPackages } from "@/app/admin/tiktok-packages/actions";
import type { TikTokCoinPackage } from "@/types/tiktok-packages";

interface TikTokPackagesClientProps {
  initialPackages: TikTokCoinPackage[];
  userRole: string;
}

export function TikTokPackagesClient({ initialPackages, userRole }: TikTokPackagesClientProps) {
  const [packages, setPackages] = useState<TikTokCoinPackage[]>(initialPackages);

  const handleUpdate = async () => {
    try {
      const updatedPackages = await getTikTokPackages();
      setPackages(updatedPackages);
    } catch (error) {
      console.error("Error refreshing packages:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TikTok Coin Packages</h1>
          <p className="text-muted-foreground">
            Manage TikTok coin pricing and packages
          </p>
        </div>
        <PackageForm onSuccess={handleUpdate} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">
              {packages.filter((p) => p.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.length > 0
                ? `₦${Math.min(...packages.map((p) => p.price)).toLocaleString()}`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              to{" "}
              {packages.length > 0
                ? `₦${Math.max(...packages.map((p) => p.price)).toLocaleString()}`
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coin Range</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.length > 0
                ? Math.min(...packages.map((p) => p.coins)).toLocaleString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              to{" "}
              {packages.length > 0
                ? Math.max(...packages.map((p) => p.coins)).toLocaleString()
                : "N/A"}{" "}
              coins
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
          <CardDescription>
            View and manage all TikTok coin packages. Active packages are visible to users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PackagesTable
            packages={packages}
            onUpdate={handleUpdate}
            userRole={userRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}
