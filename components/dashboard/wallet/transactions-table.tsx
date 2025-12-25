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
} from "lucide-react";
import { WalletTransaction } from "@/hooks/use-wallet";

interface TransactionsTableProps {
  transactions: WalletTransaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const getTransactionIcon = (type: string) => {
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
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.transaction_type)}
                      <Badge
                        variant="outline"
                        className={`${getTransactionBadgeColor(transaction.transaction_type)} text-xs hidden sm:flex`}
                      >
                        {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="font-medium text-sm break-words">
                        {transaction.description}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === 'debit' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium">
                      ₦{transaction.balance_after.toLocaleString()}
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
                      <p className="text-xs font-mono break-all max-w-[100px]">
                        {transaction.reference}
                      </p>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}