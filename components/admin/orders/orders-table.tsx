"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Wallet, MoreHorizontal, MessageCircle, User, Mail, Phone, Copy, Check } from "lucide-react";
import { formatCurrency } from "@/lib/wallet/utils";
import { Order } from "@/hooks/use-admin-orders";
import { SendNotificationButton } from "./send-notification-button";
import { toast } from "sonner";

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
  const [selectedUser, setSelectedUser] = useState<Order | null>(null);
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({ ...prev, [key]: true }));
      toast.success("Copied to clipboard!");

      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const createWhatsAppLink = (order: Order): string | undefined => {
    const whatsappNumber = order.users?.whatsapp_no;
    if (!whatsappNumber) return undefined;

    const message = encodeURIComponent(
      `Hi ${order.users?.full_name || 'there'}! This is regarding your order ${order.order_number} (${order.services?.platform || 'Wallet Funding'}) for ₦${order.total_price.toLocaleString()}. How can we assist you?`
    );
    return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
  };

  const ActionsMenu = ({ order }: { order: Order }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEditOrder(order)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Order
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onWalletUpdate(order)}>
          <Wallet className="mr-2 h-4 w-4" />
          Update Wallet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSelectedUser(order)}>
          <User className="mr-2 h-4 w-4" />
          View Customer
        </DropdownMenuItem>
        {order.users?.whatsapp_no && (
          <DropdownMenuItem asChild>
            <a
              href={createWhatsAppLink(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp Customer
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <div className="px-0 py-0">
          <SendNotificationButton order={order} variant="dropdown" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
              key: "order_number",
              label: "Order #",
              render: (order_number) => (
                <span className="font-mono text-sm">
                  {order_number as string}
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
              render: (users: any, row: Order) => {
                // The users data should now be properly loaded via the specific foreign key
                const userData = users || row.users;

                if (!userData) {
                  return (
                    <div>
                      <p className="font-medium text-sm text-red-600">
                        No User Data
                      </p>
                      <p className="text-xs text-red-500">
                        ID: {row.user_id?.slice(0, 8)}...
                      </p>
                    </div>
                  );
                }

                return (
                  <div>
                    <p className="font-medium text-sm">
                      {userData.full_name || "No Name"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{userData.username || "no-username"}
                    </p>
                  </div>
                );
              },
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
              render: (_, row: Order) => <ActionsMenu order={row} />,
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
                  {row.users?.full_name} • {row.order_number}
                </p>
              </div>
              <Badge variant="outline" className={`${statusColors[row.status]} text-xs`}>
                {row.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          )}
        />

        {/* User Profile Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                Information for order {selectedUser?.order_number}
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {selectedUser.users?.full_name || "Not provided"}
                      </p>
                      {selectedUser.users?.full_name && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedUser.users!.full_name, `name_${selectedUser.id}`)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedItems[`name_${selectedUser.id}`] ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        @{selectedUser.users?.username || "unknown"}
                      </p>
                      {selectedUser.users?.username && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedUser.users!.username, `username_${selectedUser.id}`)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedItems[`username_${selectedUser.id}`] ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">WhatsApp Number</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">
                      {selectedUser.users?.whatsapp_no || "Not provided"}
                    </p>
                    {selectedUser.users?.whatsapp_no && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedUser.users!.whatsapp_no, `whatsapp_${selectedUser.id}`)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedItems[`whatsapp_${selectedUser.id}`] ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={createWhatsAppLink(selectedUser)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Message
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">
                      {selectedUser.users?.email || "Not provided"}
                    </p>
                    {selectedUser.users?.email && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedUser.users!.email, `email_${selectedUser.id}`)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedItems[`email_${selectedUser.id}`] ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`mailto:${selectedUser.users.email}`}
                            className="flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            Email
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Order Information</label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <span className="font-mono">{selectedUser.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>{selectedUser.services?.platform || "Wallet Funding"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedUser.total_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline" className={`${statusColors[selectedUser.status]} text-xs`}>
                        {selectedUser.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}