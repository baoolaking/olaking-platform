"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStats } from "@/components/admin/orders/order-stats";
import { AdminOrderFilters } from "@/components/admin/orders/admin-order-filters";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { EditOrderDialog } from "@/components/admin/orders/edit-order-dialog";
import { WalletUpdateDialog } from "@/components/admin/orders/wallet-update-dialog";
import { Pagination } from "@/components/dashboard/orders/pagination";
import { useAdminOrders, Order } from "@/hooks/use-admin-orders";
import { useAdminOrderFilters } from "@/hooks/use-admin-order-filters";
import { usePagination } from "@/hooks/use-pagination";

export default function AdminOrdersPage() {
  const { orders, isLoading, error, updateOrderStatus, updateUserWallet } = useAdminOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

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
  } = useAdminOrderFilters(orders);

  const { currentPage, totalPages, paginatedItems: currentOrders, goToPage, resetPage } = usePagination(filteredOrders, 10);

  // Reset pagination when filters change
  useEffect(() => {
    resetPage();
  }, [filteredOrders.length, resetPage]);

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleWalletUpdate = (order: Order) => {
    setSelectedOrder(order);
    setIsWalletDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseWalletDialog = () => {
    setIsWalletDialogOpen(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">
            View and manage all platform orders
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">
          View and manage all platform orders
        </p>
      </div>

      {/* Stats */}
      <OrderStats orders={orders} />

      {/* Filters */}
      <AdminOrderFilters
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

      {/* Orders Table */}
      {currentOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-lg">
                {hasActiveFilters ? "No orders match your filters" : "No orders found"}
              </h3>
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results"
                  : "Orders will appear here once customers start placing them"
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <OrdersTable
            orders={currentOrders}
            onEditOrder={handleEditOrder}
            onWalletUpdate={handleWalletUpdate}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </>
      )}

      {/* Edit Order Dialog */}
      <EditOrderDialog
        order={selectedOrder}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onUpdate={updateOrderStatus}
      />

      {/* Wallet Update Dialog */}
      <WalletUpdateDialog
        order={selectedOrder}
        isOpen={isWalletDialogOpen}
        onClose={handleCloseWalletDialog}
        onUpdate={updateUserWallet}
      />
    </div>
  );
}