"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  History,
} from "lucide-react";
import { WalletTransaction } from "@/hooks/use-wallet";

interface TransactionCardProps {
  transaction: WalletTransaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "debit":
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      case "refund":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "credit":
        return "text-green-600";
      case "debit":
        return "text-red-600";
      case "refund":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case "credit":
        return "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400";
      case "debit":
        return "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400";
      case "refund":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getTransactionIcon(transaction.transaction_type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-sm sm:text-base break-words">
                  {transaction.description}
                </h3>
                <Badge
                  variant="outline"
                  className={`${getTransactionBadgeColor(transaction.transaction_type)} text-xs flex-shrink-0`}
                >
                  {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
                {transaction.reference && (
                  <p className="text-xs text-muted-foreground break-all">
                    Ref: {transaction.reference}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className={`font-semibold text-sm sm:text-base ${getTransactionColor(transaction.transaction_type)}`}>
              {transaction.transaction_type === 'debit' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Balance: ₦{transaction.balance_after.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}