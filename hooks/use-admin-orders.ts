"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type OrderStatus = "awaiting_payment" | "pending" | "completed" | "failed" | "awaiting_refund" | "refunded";

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
      const updateData: any = {
        status: newStatus,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      };

      // Set timestamps based on status
      const currentOrder = orders.find(o => o.id === orderId);
      if (newStatus === "completed" && currentOrder?.status !== "completed") {
        updateData.completed_at = new Date().toISOString();
      }
      if (newStatus === "pending" && currentOrder?.payment_method === "bank_transfer") {
        updateData.payment_verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, ...updateData }
          : order
      ));

      toast.success("Order status updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
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
      // Get current admin user
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Get current wallet balance from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("wallet_balance")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user wallet:", userError);
        toast.error("Failed to fetch wallet balance");
        return false;
      }

      const currentBalance = userData.wallet_balance;
      const newBalance = action === "add"
        ? currentBalance + amount
        : currentBalance - amount;

      if (newBalance < 0) {
        toast.error("Insufficient wallet balance for subtraction");
        return false;
      }

      // Update wallet balance in users table
      const { error: updateError } = await supabase
        .from("users")
        .update({
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Create wallet transaction record
      const { error: transactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: userId,
          transaction_type: action === "add" ? "credit" : "debit",
          amount: amount,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: `Admin ${action === "add" ? "credit" : "debit"} - Order ${orderId.slice(0, 8)}`,
          reference: `admin_${action}_${orderId}`,
          order_id: orderId,
          created_by: currentUser?.id || null,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        toast.error("Failed to log transaction, but wallet was updated");
      }

      toast.success(`Wallet ${action === "add" ? "credited" : "debited"} successfully`);
      return true;
    } catch (error) {
      console.error("Error updating wallet:", error);
      toast.error("Failed to update wallet balance");
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