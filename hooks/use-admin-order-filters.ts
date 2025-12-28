"use client";

import { useState, useEffect, useMemo } from "react";
import { Order } from "./use-admin-orders";
import { createClient } from "@/lib/supabase/client";

export function useAdminOrderFilters(orders: Order[]) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID for assignment filtering
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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

    // Assignment filter
    if (assignmentFilter !== "all") {
      switch (assignmentFilter) {
        case "assigned_to_me":
          filtered = filtered.filter(order => order.assigned_to === currentUserId);
          break;
        case "assigned_to_others":
          filtered = filtered.filter(order => order.assigned_to && order.assigned_to !== currentUserId);
          break;
        case "unassigned":
          filtered = filtered.filter(order => !order.assigned_to);
          break;
      }
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
        order.users?.username?.toLowerCase().includes(query) ||
        order.users?.full_name?.toLowerCase().includes(query) ||
        order.services?.platform?.toLowerCase().includes(query) ||
        order.link.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [orders, statusFilter, paymentMethodFilter, assignmentFilter, searchQuery, dateFilter, currentUserId]);

  const clearFilters = () => {
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setAssignmentFilter("all");
    setSearchQuery("");
    setDateFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all" || 
                          paymentMethodFilter !== "all" || 
                          assignmentFilter !== "all" ||
                          searchQuery.trim() !== "" || 
                          dateFilter !== "all";

  return {
    filteredOrders,
    statusFilter,
    setStatusFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    assignmentFilter,
    setAssignmentFilter,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    clearFilters,
    hasActiveFilters,
  };
}