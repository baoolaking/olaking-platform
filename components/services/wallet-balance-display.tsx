"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/wallet/utils";
import { useWalletUpdates } from "@/hooks/use-wallet-context";
import { useState, useEffect } from "react";
import { UserData } from "./types";

interface WalletBalanceDisplayProps {
  userData: UserData | null;
}

export function WalletBalanceDisplay({ userData }: WalletBalanceDisplayProps) {
  const router = useRouter();
  const [displayBalance, setDisplayBalance] = useState(userData?.wallet_balance || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update display balance when userData changes
  useEffect(() => {
    if (userData) {
      setDisplayBalance(userData.wallet_balance);
    }
  }, [userData]);

  // Listen for wallet balance updates
  useWalletUpdates((newBalance) => {
    if (newBalance !== -1) {
      setIsUpdating(true);
      setDisplayBalance(newBalance);
      // Clear updating state after a short delay
      setTimeout(() => setIsUpdating(false), 1000);
    }
  });

  if (!userData) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {isUpdating ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <Wallet className="h-5 w-5 text-primary" />
          )}
          <div>
            <p className="text-sm text-muted-foreground">
              Wallet Balance {isUpdating && "(updating...)"}
            </p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(displayBalance)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/wallet")}
        >
          Manage Wallet
        </Button>
      </CardContent>
    </Card>
  );
}