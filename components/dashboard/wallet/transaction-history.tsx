"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Grid, List } from "lucide-react";
import { TransactionCard } from "./transaction-card";
import { TransactionsTable } from "./transactions-table";
import { Pagination } from "../orders/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { WalletTransaction } from "@/hooks/use-wallet";

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { currentPage, totalPages, paginatedItems: currentTransactions, goToPage } = usePagination(transactions, 10);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Your recent wallet transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No transactions yet</h3>
            <p className="text-muted-foreground">
              Your wallet transactions will appear here once you start using your wallet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Your recent wallet transactions ({transactions.length} total)
              </CardDescription>
            </div>

            {/* View Toggle - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Always show cards on mobile (md and below), allow toggle on desktop */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {currentTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        {viewMode === 'cards' ? (
          <div className="space-y-3">
            {currentTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <TransactionsTable transactions={currentTransactions} />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}