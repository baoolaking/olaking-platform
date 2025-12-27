"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type OrderStatus = "awaiting_payment" | "awaiting_confirmation" | "pending" | "completed" | "failed" | "awaiting_refund" | "refunded";

export interface Order {
  id: string;
  order_number: string;
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
    email: string;
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

      console.log("🔍 Fetching admin orders...");

      // Use a simpler, more reliable query
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          users!orders_user_id_fkey (
            username,
            full_name,
            whatsapp_no,
            email
          ),
          services (
            platform,
            service_type,
            price_per_1k
          )
        `)
        .order("created_at", { ascending: false });

      console.log("🔍 Orders query result:", { 
        ordersCount: ordersData?.length || 0, 
        error: ordersError,
        sampleOrder: ordersData?.[0]
      });

      if (ordersError) {
        console.error("❌ Error fetching orders:", ordersError);
        
        // Try using the server API as fallback
        console.log("🔄 Trying server API fallback...");
        try {
          const response = await fetch('/api/admin/orders');
          if (response.ok) {
            const apiData = await response.json();
            console.log("✅ Server API fallback successful:", apiData.orders?.length || 0);
            setOrders(apiData.orders || []);
            setError(null);
            return;
          } else {
            console.error("❌ Server API fallback failed:", response.status);
          }
        } catch (apiError) {
          console.error("❌ Server API fallback error:", apiError);
        }
        
        setError(`Failed to fetch orders: ${ordersError.message || 'Unknown error'}`);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        console.log("⚠️ No orders found");
        setOrders([]);
        setError(null);
        return;
      }

      // Check for missing user data
      const ordersWithoutUsers = ordersData.filter(order => !order.users);
      if (ordersWithoutUsers.length > 0) {
        console.log("⚠️ Found orders with missing user data:", ordersWithoutUsers.length);
        console.log("🔍 Sample order without user:", ordersWithoutUsers[0]);
        
        // Try to fetch missing users manually
        const missingUserIds = ordersWithoutUsers.map(order => order.user_id);
        console.log("🔍 Fetching missing users for IDs:", missingUserIds);
        
        const { data: missingUsers, error: usersError } = await supabase
          .from("users")
          .select("id, username, full_name, whatsapp_no, email")
          .in("id", missingUserIds);

        console.log("🔍 Missing users query result:", { missingUsers, usersError });

        if (!usersError && missingUsers) {
          // Manually attach user data
          const fixedOrders = ordersData.map(order => {
            if (!order.users) {
              const userData = missingUsers.find(u => u.id === order.user_id);
              return { ...order, users: userData || null };
            }
            return order;
          });
          
          console.log("✅ Fixed orders with manual user data attachment");
          setOrders(fixedOrders);
        } else {
          console.log("❌ Could not fetch missing users, using original data");
          setOrders(ordersData);
        }
      } else {
        console.log("✅ All orders have user data");
        setOrders(ordersData);
      }
      
      setError(null);
    } catch (err) {
      console.error("💥 Unexpected error:", err);
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