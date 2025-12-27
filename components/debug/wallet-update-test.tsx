"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { broadcastWalletUpdate } from "@/hooks/use-wallet-context";
import { useState } from "react";

export function WalletUpdateTest() {
  const [testBalance, setTestBalance] = useState(5000);

  const handleTestUpdate = () => {
    const newBalance = testBalance - 100;
    setTestBalance(newBalance);
    broadcastWalletUpdate(newBalance);
  };

  const handleTestReset = () => {
    const resetBalance = 5000;
    setTestBalance(resetBalance);
    broadcastWalletUpdate(resetBalance);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wallet Update Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test wallet balance updates across components
        </p>
        <div className="flex gap-2">
          <Button onClick={handleTestUpdate} size="sm">
            Deduct ₦100
          </Button>
          <Button onClick={handleTestReset} variant="outline" size="sm">
            Reset to ₦5,000
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Current test balance: ₦{testBalance.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}