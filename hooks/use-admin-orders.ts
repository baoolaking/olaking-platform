"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type OrderStatus = "awaiting_payment" | "awaiting_confirmation" | "pending" | "completed" | "failed" | "awaiting_refund" | "refunded";

export interface Order {
  id: string;
  user_id: string;
  service_id: string | null;
  quantity: number;
  price_per_1k: number;
  total_price: number;
  status: OrderStatus;
  link: string;
  quality_type: string;
  payment_method: string;
  bank_account_id: string | null;
  payment_verified_at: string | null;
  admin_notes: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  users?: {
    username: string;
    full_name: string;
    whatsapp_no: string;
  } | null;
  services?: {
    platform: string;
    service_type: string;
    price_per_1k: number;
  } | null;
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrders = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/login";
        return;
      }

      // Fetch all orders with user and service details
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
          *,
          users!orders_user_id_fkey (username, full_name, whatsapp_no),
          services (platform, service_type, price_per_1k)
        `
        )
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setError("Failed to fetch orders");
      } else {
        setOrders(ordersData || []);
        setError(null);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    adminNotes: string
  ) => {
    try {
      // Import the server action dynamically
      const { updateOrderStatus: serverUpdateOrderStatus } = await import("@/app/admin/orders/actions");
      
      const result = await serverUpdateOrderStatus(orderId, newStatus, adminNotes);
      
      if (result.success) {
        // Refresh orders to get updated data
        await fetchOrders();
        toast.success("Order status updated successfully");
        return true;
      } else {
        toast.error("Failed to update order status");
        return false;
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
      return false;
    }
  };

  const updateUserWallet = async (
    userId: string,
    orderId: string,
    amount: number,
    action: "add" | "subtract"
  ) => {
    try {
      // Import the server action dynamically
      const { updateUserWallet: serverUpdateWallet } = await import("@/app/admin/wallet/actions");
      
      const result = await serverUpdateWallet(userId, orderId, amount, action);
      
      if (result.success) {
        toast.success(result.message);
        return true;
      } else {
        toast.error("Failed to update wallet balance");
        return false;
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update wallet balance");
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    updateUserWallet,
    setOrders,
  };
}