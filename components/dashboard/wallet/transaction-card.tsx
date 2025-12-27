"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  History,
  Clock,
} from "lucide-react";
import { WalletTransaction } from "@/hooks/use-wallet";

interface TransactionCardProps {
  transaction: WalletTransaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  // Check if this is a pending transaction
  const isPending = transaction.balance_before === transaction.balance_after &&
    transaction.description.toLowerCase().includes('pending');

  const getTransactionIcon = (type: string, isPending: boolean) => {
    if (isPending) {
      return <History className="h-4 w-4 text-orange-600 animate-pulse" />;
    }
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

  const getTransactionColor = (type: string, isPending: boolean) => {
    if (isPending) {
      return "text-orange-600";
    }
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

  const getTransactionBadgeColor = (type: string, isPending: boolean) => {
    if (isPending) {
      return "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400 animate-pulse";
    }
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

  const getBadgeText = (type: string, isPending: boolean) => {
    if (isPending) {
      return "Pending";
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isPending ? 'border-orange-200 bg-orange-50/30 dark:border-orange-800 dark:bg-orange-950/30' : ''}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-0.5 sm:mt-1">
              {getTransactionIcon(transaction.transaction_type, isPending)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
                <h3 className="font-medium text-xs sm:text-sm md:text-base break-words leading-tight">
                  {transaction.description}
                </h3>
                <Badge
                  variant="outline"
                  className={`${getTransactionBadgeColor(transaction.transaction_type, isPending)} text-xs flex-shrink-0 px-1.5 py-0.5`}
                >
                  {isPending ? "Pending" : getBadgeText(transaction.transaction_type, isPending)}
                </Badge>
              </div>

              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {transaction.reference && (
                  <p className="text-xs text-muted-foreground break-all font-mono">
                    {transaction.reference.length > 20
                      ? `${transaction.reference.substring(0, 20)}...`
                      : transaction.reference
                    }
                  </p>
                )}
                {isPending && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ⏳ Awaiting verification
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className={`font-semibold text-sm sm:text-base ${getTransactionColor(transaction.transaction_type, isPending)}`}>
              {isPending ? '⏳' : (transaction.transaction_type === 'debit' ? '-' : '+')}₦{transaction.amount.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              ₦{transaction.balance_after.toLocaleString()}
              {isPending && <span className="text-orange-600 dark:text-orange-400 block sm:inline"> (pending)</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}