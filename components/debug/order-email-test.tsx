"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export function OrderEmailTest() {
  const [isTestingWallet, setIsTestingWallet] = useState(false);
  const [isTestingBank, setIsTestingBank] = useState(false);

  const testWalletOrderEmail = async () => {
    setIsTestingWallet(true);
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: "test-service-id",
          quantity: 1000,
          price_per_1k: 50,
          total_price: 50,
          status: "pending",
          link: "https://instagram.com/test",
          quality_type: "high_quality",
          payment_method: "wallet",
        }),
      });

      if (response.ok) {
        toast.success("Test wallet order created! Check admin emails.");
      } else {
        const error = await response.json();
        toast.error(`Test failed: ${error.error}`);
      }
    } catch (error) {
      toast.error("Test failed: Network error");
    } finally {
      setIsTestingWallet(false);
    }
  };

  const testBankTransferOrderEmail = async () => {
    setIsTestingBank(true);
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: "test-service-id",
          quantity: 2000,
          price_per_1k: 75,
          total_price: 150,
          status: "awaiting_payment",
          link: "https://instagram.com/test",
          quality_type: "high_quality",
          payment_method: "bank_transfer",
          bank_account_id: "test-bank-id",
        }),
      });

      if (response.ok) {
        toast.success("Test bank transfer order created! Check admin emails.");
      } else {
        const error = await response.json();
        toast.error(`Test failed: ${error.error}`);
      }
    } catch (error) {
      toast.error("Test failed: Network error");
    } finally {
      setIsTestingBank(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Order Email Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test admin email notifications for service orders
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={testWalletOrderEmail}
            disabled={isTestingWallet}
            size="sm"
          >
            {isTestingWallet ? "Testing..." : "Test Wallet Order Email"}
          </Button>
          <Button
            onClick={testBankTransferOrderEmail}
            disabled={isTestingBank}
            variant="outline"
            size="sm"
          >
            {isTestingBank ? "Testing..." : "Test Bank Transfer Email"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: These will create test orders and send real emails to admins.
        </p>
      </CardContent>
    </Card>
  );
}