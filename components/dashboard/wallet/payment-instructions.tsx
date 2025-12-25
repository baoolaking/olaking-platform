"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { BankAccount } from "@/hooks/use-wallet";

interface PaymentInstructionsProps {
  amount: number;
  bankAccountId: string;
  bankAccounts: BankAccount[];
}

export function PaymentInstructions({
  amount,
  bankAccountId,
  bankAccounts,
}: PaymentInstructionsProps) {
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>({});

  const selectedAccount = bankAccounts.find(acc => acc.id === bankAccountId);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({ ...prev, [key]: true }));
      toast.success("Copied to clipboard!");

      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  if (!selectedAccount) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="text-orange-800 dark:text-orange-200">
          Payment Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700 dark:text-orange-300">
          Please transfer <strong>₦{amount.toLocaleString()}</strong> to the selected bank account.
        </p>
        <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg border">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Bank</p>
                <p className="font-medium break-words">{selectedAccount.bank_name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(selectedAccount.bank_name, "bank_name")}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {copiedItems.bank_name ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-medium font-mono text-sm sm:text-lg break-all">{selectedAccount.account_number}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(selectedAccount.account_number, "account_number")}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {copiedItems.account_number ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-medium break-words">{selectedAccount.account_name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(selectedAccount.account_name, "account_name")}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {copiedItems.account_name ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Amount to Transfer</p>
                  <p className="font-bold text-sm sm:text-lg text-orange-700 dark:text-orange-300 break-all">₦{amount.toLocaleString()}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(amount.toString(), "amount")}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  {copiedItems.amount ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-orange-600 dark:text-orange-400">
          After making the payment, please wait for admin confirmation. We check payments every few minutes.
        </p>
      </CardContent>
    </Card>
  );
}