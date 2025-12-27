"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { broadcastWalletUpdate } from "@/hooks/use-wallet-context";
import { useState } from "react";

export function HeaderWalletTest() {
  const [testBalance, setTestBalance] = useState(10000);

  const handleDeductTest = () => {
    const newBalance = testBalance - 500;
    setTestBalance(newBalance);
    broadcastWalletUpdate(newBalance);
  };

  const handleAddTest = () => {
    const newBalance = testBalance + 1000;
    setTestBalance(newBalance);
    broadcastWalletUpdate(newBalance);
  };

  const handleResetTest = () => {
    const resetBalance = 10000;
    setTestBalance(resetBalance);
    broadcastWalletUpdate(resetBalance);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Header Wallet Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test wallet balance updates in the dashboard header
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleDeductTest} size="sm" variant="destructive">
            Deduct ₦500
          </Button>
          <Button onClick={handleAddTest} size="sm" variant="default">
            Add ₦1,000
          </Button>
          <Button onClick={handleResetTest} variant="outline" size="sm">
            Reset
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Current test balance: ₦{testBalance.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Check the header wallet balance to see if it updates in real-time.
        </p>
      </CardContent>
    </Card>
  );
}