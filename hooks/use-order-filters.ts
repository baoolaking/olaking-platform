"use client";

import { useState, useEffect, useMemo } from "react";
import { Order } from "./use-orders";

export function useOrderFilters(orders: Order[]) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment method filter
    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(order => order.payment_method === paymentMethodFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.link.toLowerCase().includes(query) ||
        (order.services?.platform?.toLowerCase().includes(query)) ||
        (order.services?.service_type?.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [orders, statusFilter, paymentMethodFilter, searchQuery, dateFilter]);

  const clearFilters = () => {
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setSearchQuery("");
    setDateFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all" || 
                          paymentMethodFilter !== "all" || 
                          searchQuery.trim() !== "" || 
                          dateFilter !== "all";

  return {
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
  };
}