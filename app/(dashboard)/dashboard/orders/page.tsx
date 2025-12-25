"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ExternalLink, Grid, List } from "lucide-react";
import { OrderFilters } from "@/components/dashboard/orders/order-filters";
import { OrderCard } from "@/components/dashboard/orders/order-card";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { Pagination } from "@/components/dashboard/orders/pagination";
import { EmptyState } from "@/components/dashboard/orders/empty-state";
import { useOrders } from "@/hooks/use-orders";
import { useOrderFilters } from "@/hooks/use-order-filters";
import { usePagination } from "@/hooks/use-pagination";

export default function OrdersPage() {
  const { orders, isLoading, isRefreshing, handleRefresh } = useOrders();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const {
    filteredOrders,
    statusFilter,
    setStatusFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    clearFilters,
    hasActiveFilters,
  } = useOrderFilters(orders);

  const { currentPage, totalPages, paginatedItems: currentOrders, goToPage, resetPage } = usePagination(filteredOrders, 5);

  // Reset pagination when filters change
  useEffect(() => {
    resetPage();
  }, [filteredOrders.length, resetPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            View and manage your service orders
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/services" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <ExternalLink className="mr-2 h-4 w-4" />
              <span className="sm:inline">Browse Services</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onClearFilters={clearFilters}
        totalResults={orders.length}
        filteredResults={filteredOrders.length}
        currentResults={currentOrders.length}
      />

      {/* Orders List */}
      {currentOrders.length === 0 ? (
        <EmptyState
          hasOrders={orders.length > 0}
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      ) : (
        <>
          {/* Always show cards on mobile (md and below), allow toggle on desktop */}
          <div className="block md:hidden">
            <div className="space-y-4">
              {currentOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            {viewMode === 'cards' ? (
              <div className="space-y-4">
                {currentOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <OrdersTable orders={currentOrders} />
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </>
      )}
    </div>
  );
}