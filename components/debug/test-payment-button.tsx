"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestPaymentButton() {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [orderCheck, setOrderCheck] = useState<any>(null);
  const [updateTest, setUpdateTest] = useState<any>(null);
  const [rlsTest, setRlsTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkOrder = async () => {
    if (!orderId.trim()) {
      alert("Please enter an order ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/debug/check-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim() }),
      });

      const data = await response.json();
      console.log("🔍 Order check result:", data);
      setOrderCheck(data);
    } catch (error) {
      console.error("🔍 Order check error:", error);
      setOrderCheck({ error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  const checkRlsPolicies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/debug/check-rls-policies");
      const data = await response.json();
      console.log("🔍 RLS policies check result:", data);
      setRlsTest(data);
    } catch (error) {
      console.error("🔍 RLS policies check error:", error);
      setRlsTest({ error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdateMethods = async () => {
    if (!orderId.trim()) {
      alert("Please enter an order ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/debug/test-update-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim() }),
      });

      const data = await response.json();
      console.log("🧪 Update methods test result:", data);
      setUpdateTest(data);
    } catch (error) {
      console.error("🧪 Update methods test error:", error);
      setUpdateTest({ error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  const testPaymentConfirmation = async () => {
    if (!orderId.trim()) {
      alert("Please enter an order ID");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log("🧪 Testing payment confirmation for order:", orderId);

      const response = await fetch("/api/debug/test-payment-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: orderId.trim() }),
      });

      const data = await response.json();
      console.log("🧪 Test result:", data);
      setResult(data);

    } catch (error) {
      console.error("🧪 Test error:", error);
      setResult({
        success: false,
        error: "Network error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
      <CardHeader>
        <CardTitle className="text-purple-800 dark:text-purple-200">
          🧪 Debug Payment Confirmation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-2">
          <Button
            onClick={checkRlsPolicies}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
          >
            Check RLS
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={checkOrder}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Check
          </Button>
          <Button
            onClick={testUpdateMethods}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Test Updates
          </Button>
          <Button
            onClick={testPaymentConfirmation}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? "Testing..." : "Full Test"}
          </Button>
        </div>

        {rlsTest && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 rounded border">
            <h4 className="font-medium mb-2">RLS Policies Check:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(rlsTest, null, 2)}
            </pre>
          </div>
        )}

        {orderCheck && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded border">
            <h4 className="font-medium mb-2">Order Check:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(orderCheck, null, 2)}
            </pre>
          </div>
        )}

        {updateTest && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded border">
            <h4 className="font-medium mb-2">Update Methods Test:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(updateTest, null, 2)}
            </pre>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded border">
            <h4 className="font-medium mb-2">Full Test Result:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>How to get Order ID:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a wallet funding order</li>
            <li>Check browser console for "Order ID received: [ID]"</li>
            <li>Or check the payment instructions URL/network tab</li>
            <li>Paste the ID above and click Test</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}