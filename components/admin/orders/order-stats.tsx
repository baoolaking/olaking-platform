"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/hooks/use-admin-orders";

interface OrderStatsProps {
  orders: Order[];
}

export function OrderStats({ orders }: OrderStatsProps) {
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const completedOrders = orders?.filter((o) => o.status === "completed").length || 0;
  const awaitingPayment = orders?.filter((o) => o.status === "awaiting_payment").length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + o.total_price, 0) || 0;

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      className: "col-span-1",
    },
    {
      title: "Pending",
      value: pendingOrders,
      className: "col-span-1",
    },
    {
      title: "Completed",
      value: completedOrders,
      className: "col-span-1",
    },
    {
      title: "Awaiting Payment",
      value: awaitingPayment,
      className: "col-span-1",
    },
    {
      title: "Total Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      className: "col-span-1",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index} className={stat.className}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}