"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface EmptyStateProps {
  hasOrders: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasOrders, hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {hasFilters && hasOrders
                ? "No orders match your filters"
                : "No orders yet"
              }
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              {hasFilters && hasOrders
                ? "Try adjusting your filters to see more results"
                : "Start by browsing our services or funding your wallet"
              }
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {hasFilters && hasOrders ? (
              <Button onClick={onClearFilters}>Clear Filters</Button>
            ) : (
              <>
                <Link href="/dashboard/services" className="w-full sm:w-auto">
                  <Button className="w-full">Browse Services</Button>
                </Link>
                <Link href="/dashboard/wallet" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">Fund Wallet</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}