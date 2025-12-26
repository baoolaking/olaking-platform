"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Edit, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/wallet/utils";
import { Order } from "@/hooks/use-admin-orders";
import { SendNotificationButton } from "./send-notification-button";

interface OrdersTableProps {
  orders: Order[];
  onEditOrder: (order: Order) => void;
  onWalletUpdate: (order: Order) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  awaiting_payment: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  awaiting_confirmation: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  awaiting_refund: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function OrdersTable({ orders, onEditOrder, onWalletUpdate }: OrdersTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            Complete list of all platform orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No orders found
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>
          Complete list of all platform orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveTable
          columns={[
            {
              key: "id",
              label: "Order ID",
              render: (id) => (
                <span className="font-mono text-sm">
                  {(id as string).slice(0, 8)}
                </span>
              ),
            },
            {
              key: "services",
              label: "Service",
              render: (services: any) => (
                <div>
                  <p className="font-medium text-sm">{services?.platform || "Wallet Funding"}</p>
                  <p className="text-xs text-muted-foreground">
                    {services?.service_type || "N/A"}
                  </p>
                </div>
              ),
            },
            {
              key: "users",
              label: "Customer",
              render: (users: any) => (
                <div>
                  <p className="font-medium text-sm">{users?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{users?.username}
                  </p>
                </div>
              ),
            },
            {
              key: "link",
              label: "Link",
              render: (link: any) => (
                <span className="max-w-32 truncate text-xs block">
                  {link === "wallet_funding" ? "Wallet Funding" : link}
                </span>
              ),
            },
            {
              key: "quantity",
              label: "Quantity",
              render: (qty: any) => (
                <span className="text-sm">{qty?.toLocaleString() || "1"}</span>
              ),
            },
            {
              key: "total_price",
              label: "Amount",
              render: (amount: any) => (
                <span className="font-medium text-sm">
                  {formatCurrency(amount)}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (status: any) => (
                <Badge variant="outline" className={`${statusColors[status]} text-xs`}>
                  {status.replace("_", " ").toUpperCase()}
                </Badge>
              ),
            },
            {
              key: "created_at",
              label: "Date",
              render: (date: any) => (
                <div className="text-xs">
                  <div>{new Date(date).toLocaleDateString()}</div>
                  <div className="text-muted-foreground">
                    {new Date(date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (_, row: Order) => (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditOrder(row)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onWalletUpdate(row)}
                    className="h-8 w-8 p-0"
                  >
                    <Wallet className="h-3 w-3" />
                  </Button>
                  <SendNotificationButton order={row} />
                </div>
              ),
            },
          ]}
          data={orders}
          keyField="id"
          getMobileTitle={(row: Order) => (
            <div className="flex text-left items-center justify-between w-full">
              <div>
                <p className="font-medium text-sm">
                  {row.services?.platform || "Wallet Funding"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.users?.full_name} • {row.id.slice(0, 8)}
                </p>
              </div>
              <Badge variant="outline" className={`${statusColors[row.status]} text-xs`}>
                {row.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}