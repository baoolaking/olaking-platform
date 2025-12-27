"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { broadcastWalletUpdate, triggerWalletRefresh } from "@/hooks/use-wallet-context";
import { useState } from "react";
import { toast } from "sonner";

export function WalletSyncTest() {
  const [testBalance, setTestBalance] = useState(15000);

  const handleDirectUpdate = () => {
    const newBalance = testBalance + 1000;
    setTestBalance(newBalance);
    broadcastWalletUpdate(newBalance);
    toast.success(`Broadcasted wallet update: ₦${newBalance.toLocaleString()}`);
  };

  const handleTriggerRefresh = () => {
    triggerWalletRefresh();
    toast.info("Triggered wallet refresh across all components");
  };

  const handleSimulateWalletFunding = async () => {
    try {
      // Simulate a wallet credit API call
      const response = await fetch("/api/wallet/credit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test-user-id",
          amount: 500,
          description: "Test wallet funding",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.newBalance) {
          broadcastWalletUpdate(result.newBalance);
          toast.success(`Wallet credited! New balance: ₦${result.newBalance.toLocaleString()}`);
        } else {
          toast.success("Wallet credited successfully!");
          triggerWalletRefresh();
        }
      } else {
        const error = await response.json();
        toast.error(`Credit failed: ${error.error}`);
      }
    } catch (error) {
      toast.error("Network error during wallet credit");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wallet Sync Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test wallet balance synchronization across all dashboard components
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={handleDirectUpdate} size="sm">
            Direct Update (+₦1,000)
          </Button>
          <Button onClick={handleTriggerRefresh} variant="outline" size="sm">
            Trigger Refresh
          </Button>
          <Button onClick={handleSimulateWalletFunding} variant="secondary" size="sm">
            Simulate Wallet Credit
          </Button>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Current test balance: ₦{testBalance.toLocaleString()}</p>
          <p>Check header, services page, and wallet page for updates.</p>
          <p>Also test by switching tabs and coming back.</p>
        </div>
      </CardContent>
    </Card>
  );
}