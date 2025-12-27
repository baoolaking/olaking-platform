"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, Loader2 } from "lucide-react";
import { useWalletUpdates } from "@/hooks/use-wallet-context";
import { useState, useEffect } from "react";

interface WalletBalanceCardProps {
  balance: number;
  onFundWallet: () => void;
  showFundingForm: boolean;
  isPolling: boolean;
}

export function WalletBalanceCard({
  balance,
  onFundWallet,
  showFundingForm,
  isPolling,
}: WalletBalanceCardProps) {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update display balance when balance prop changes
  useEffect(() => {
    setDisplayBalance(balance);
  }, [balance]);

  // Listen for wallet balance updates
  useWalletUpdates((newBalance) => {
    if (newBalance !== -1) {
      setIsUpdating(true);
      setDisplayBalance(newBalance);
      // Clear updating state after a short delay
      setTimeout(() => setIsUpdating(false), 1000);
    }
  });
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUpdating ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <Wallet className="h-6 w-6 text-primary" />
          )}
          Current Balance {isUpdating && "(updating...)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl sm:text-4xl font-bold text-primary mb-4">
          ₦{displayBalance.toLocaleString()}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onFundWallet}
            className="flex items-center gap-2"
            disabled={showFundingForm || isPolling}
          >
            <Plus className="h-4 w-4" />
            Fund Wallet
          </Button>
          {isPolling && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Waiting for payment confirmation...</span>
              <span className="sm:hidden">Waiting...</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}