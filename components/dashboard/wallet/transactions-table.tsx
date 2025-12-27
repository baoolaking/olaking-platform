"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  History,
  Clock,
} from "lucide-react";
import { WalletTransaction } from "@/hooks/use-wallet";

interface TransactionsTableProps {
  transactions: WalletTransaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  // Check if a transaction is pending
  const isPending = (transaction: WalletTransaction) =>
    transaction.balance_before === transaction.balance_after &&
    transaction.description.toLowerCase().includes('pending');

  const getTransactionIcon = (type: string, isPending: boolean) => {
    if (isPending) {
      return <History className="h-3 w-3 text-orange-600 animate-pulse" />;
    }
    switch (type) {
      case "credit":
        return <ArrowUpRight className="h-3 w-3 text-green-600" />;
      case "debit":
        return <ArrowDownLeft className="h-3 w-3 text-red-600" />;
      case "refund":
        return <RefreshCw className="h-3 w-3 text-blue-600" />;
      default:
        return <History className="h-3 w-3 text-gray-600" />;
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
    <Card>
      <CardHeader>
        <CardTitle>Transaction History (Table View)</CardTitle>
        <CardDescription>
          Detailed view of your wallet transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[40px]">Type</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="min-w-[100px]">Amount</TableHead>
                <TableHead className="min-w-[100px]">Balance After</TableHead>
                <TableHead className="min-w-[120px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const transactionPending = isPending(transaction);
                return (
                  <TableRow
                    key={transaction.id}
                    className={`hover:bg-muted/50 ${transactionPending ? 'bg-orange-50/50 dark:bg-orange-950/20 border-l-4 border-l-orange-400' : ''}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transaction_type, transactionPending)}
                        <Badge
                          variant="outline"
                          className={`${getTransactionBadgeColor(transaction.transaction_type, transactionPending)} text-xs hidden sm:flex`}
                        >
                          {getBadgeText(transaction.transaction_type, transactionPending)}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[150px] sm:max-w-[200px]">
                        <p className="font-medium text-xs sm:text-sm break-words leading-tight">
                          {transaction.description}
                        </p>
                        {transactionPending && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            ⏳ Pending
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className={`font-semibold ${getTransactionColor(transaction.transaction_type, transactionPending)}`}>
                        {transactionPending ? '⏳' : (transaction.transaction_type === 'debit' ? '-' : '+')}₦{transaction.amount.toLocaleString()}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-sm sm:text-base">
                        ₦{transaction.balance_after.toLocaleString()}
                        {transactionPending && (
                          <span className="text-xs text-orange-600 dark:text-orange-400 block">
                            (pending)
                          </span>
                        )}
                      </p>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {transaction.reference ? (
                        <p className="text-xs font-mono break-all max-w-[80px] sm:max-w-[100px]">
                          {transaction.reference.length > 12
                            ? `${transaction.reference.substring(0, 12)}...`
                            : transaction.reference
                          }
                        </p>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}