"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type OrderStatus =
  | "awaiting_payment"
  | "awaiting_confirmation"
  | "pending"
  | "completed"
  | "failed"
  | "awaiting_refund"
  | "refunded";

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
  assigned_to: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  services?: {
    platform: string;
    service_type: string;
    price_per_1k: number;
  } | null;
  bank_accounts?: {
    account_name: string;
    account_number: string;
    bank_name: string;
  } | null;
}

export function useOrders() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      // Fetch orders with service and bank account details
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          services (
            platform,
            service_type,
            price_per_1k
          ),
          bank_accounts (
            account_name,
            account_number,
            bank_name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  useEffect(() => {
    loadOrders();

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order updated:', payload);
          loadOrders(); // Reload orders when there's a change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    orders,
    isLoading,
    isRefreshing,
    handleRefresh,
    loadOrders,
  };
}