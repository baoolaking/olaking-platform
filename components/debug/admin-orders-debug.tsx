"use client";

import { useEffect } from "react";
import { useAdminOrders } from "@/hooks/use-admin-orders";

export function AdminOrdersDebug() {
  const { orders, isLoading } = useAdminOrders();

  useEffect(() => {
    if (!isLoading && orders.length > 0) {
      console.log("🔍 Admin Orders Debug - First Order:", orders[0]);
      console.log("🔍 Admin Orders Debug - User Data:", orders[0]?.users);
      console.log("🔍 Admin Orders Debug - All Orders Count:", orders.length);

      // Check if any orders have user data
      const ordersWithUsers = orders.filter(order => order.users);
      const ordersWithoutUsers = orders.filter(order => !order.users);

      console.log("✅ Orders with user data:", ordersWithUsers.length);
      console.log("❌ Orders without user data:", ordersWithoutUsers.length);

      if (ordersWithUsers.length > 0) {
        console.log("🔍 Sample order WITH user data:", {
          order_id: ordersWithUsers[0].id,
          order_number: ordersWithUsers[0].order_number,
          user_data: ordersWithUsers[0].users
        });
      }

      if (ordersWithoutUsers.length > 0) {
        console.log("🔍 Sample order WITHOUT user data:", {
          order_id: ordersWithoutUsers[0].id,
          order_number: ordersWithoutUsers[0].order_number,
          user_id: ordersWithoutUsers[0].user_id
        });
      }
    }
  }, [orders, isLoading]);

  return null; // This is just for debugging
}