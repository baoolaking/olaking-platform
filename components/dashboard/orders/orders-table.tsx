"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ExternalLink,
  Wallet,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatCurrency } from "@/lib/wallet/utils";
import { formatPlatformName, formatServiceType } from "@/lib/validations/wallet";
import { Order } from "@/hooks/use-orders";

type OrderStatus =
  | "awaiting_payment"
  | "awaiting_confirmation"
  | "pending"
  | "completed"
  | "failed"
  | "awaiting_refund"
  | "refunded";

interface OrdersTableProps {
  orders: Order[];
}

const statusConfig: Record<OrderStatus, {
  color: string;
  icon: React.ReactNode;
  label: string;
}> = {
  awaiting_payment: {
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
    icon: <Clock className="h-3 w-3" />,
    label: "Awaiting Payment",
  },
  awaiting_confirmation: {
    color: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Awaiting Confirmation",
  },
  pending: {
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    icon: <Clock className="h-3 w-3" />,
    label: "Pending",
  },
  completed: {
    color: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
    label: "Completed",
  },
  failed: {
    color: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
    icon: <XCircle className="h-3 w-3" />,
    label: "Failed",
  },
  awaiting_refund: {
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Awaiting Refund",
  },
  refunded: {
    color: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
    icon: <RefreshCw className="h-3 w-3" />,
    label: "Refunded",
  },
};

// Helper function to get approval status badge
const getApprovalStatus = (order: Order): { color: string; icon: React.ReactNode; label: string } | null => {
  // Only show approval status for pending orders
  if (order.status === "pending") {
    if (order.assigned_to) {
      return {
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: "Approved",
      };
    } else {
      return {
        color: "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-400",
        icon: <Clock className="h-3 w-3" />,
        label: "Unapproved",
      };
    }
  }
  return null;
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>({});

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

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

  const getPaymentMethodIcon = (method: string) => {
    return method === "wallet" ? (
      <Wallet className="h-3 w-3" />
    ) : (
      <CreditCard className="h-3 w-3" />
    );
  };

  const isWalletOrder = (order: Order) => {
    return order.link === "wallet_funding" && !order.service_id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Table View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="min-w-[120px]">Service</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[80px]">Amount</TableHead>
                <TableHead className="min-w-[80px]">Payment</TableHead>
                <TableHead className="min-w-[100px]">Created</TableHead>
                <TableHead className="min-w-[100px]">Order ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusInfo = statusConfig[order.status];
                const approvalInfo = getApprovalStatus(order);
                const isWallet = isWalletOrder(order);
                const isExpanded = expandedRows.has(order.id);

                return (
                  <>
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(order.id)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isWallet ? (
                            <>
                              <Wallet className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium">Wallet Funding</span>
                            </>
                          ) : (
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {formatPlatformName(order.services?.platform || "")}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {formatServiceType(order.services?.service_type || "")}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={`${statusInfo.color} flex items-center gap-1 text-xs w-fit`}
                          >
                            {statusInfo.icon}
                            <span className="hidden sm:inline">{statusInfo.label}</span>
                          </Badge>
                          {approvalInfo && (
                            <Badge
                              variant="outline"
                              className={`${approvalInfo.color} flex items-center gap-1 text-xs w-fit`}
                            >
                              {approvalInfo.icon}
                              <span className="hidden sm:inline">{approvalInfo.label}</span>
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm font-medium">
                          {formatCurrency(order.total_price)}
                        </div>
                        {!isWallet && (
                          <div className="text-xs text-muted-foreground">
                            {order.quantity.toLocaleString()} items
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(order.payment_method)}
                          <span className="text-xs">
                            {order.payment_method === "wallet" ? "Wallet" : "Bank"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">
                            {order.order_number}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(order.order_number, `table_number_${order.id}`)}
                            className="h-5 w-5 p-0 hover:bg-muted"
                            title="Copy Order Number"
                          >
                            {copiedItems[`table_number_${order.id}`] ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          {!isWallet && order.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-5 w-5 p-0 hover:bg-muted ml-1"
                              title="Open Link"
                            >
                              <a
                                href={order.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row Details */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/20">
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Order Number:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs break-all">{order.order_number}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(order.order_number, `expanded_order_number_${order.id}`)}
                                    className="h-5 w-5 p-0 hover:bg-muted flex-shrink-0"
                                    title="Copy Order Number"
                                  >
                                    {copiedItems[`expanded_order_number_${order.id}`] ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {!isWallet && (
                                <>
                                  <div>
                                    <span className="font-medium">Quality:</span>
                                    <div className="capitalize">{order.quality_type.replace("_", " ")}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Price per 1k:</span>
                                    <div>{formatCurrency(order.price_per_1k)}</div>
                                  </div>
                                </>
                              )}

                              {order.completed_at && (
                                <div>
                                  <span className="font-medium">Completed:</span>
                                  <div>{new Date(order.completed_at).toLocaleString()}</div>
                                </div>
                              )}

                              {order.payment_verified_at && (
                                <div>
                                  <span className="font-medium">Payment Verified:</span>
                                  <div>{new Date(order.payment_verified_at).toLocaleString()}</div>
                                </div>
                              )}
                            </div>

                            {!isWallet && order.link && (
                              <div>
                                <span className="font-medium">Target Link:</span>
                                <a
                                  href={order.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1 break-all text-sm mt-1"
                                >
                                  <span className="break-all">{order.link}</span>
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                              </div>
                            )}

                            {order.admin_notes && (
                              <div>
                                <span className="font-medium">Admin Notes:</span>
                                <div className="text-sm mt-1 p-2 bg-muted rounded">
                                  {order.admin_notes}
                                </div>
                              </div>
                            )}

                            {/* Payment Instructions for Bank Transfer */}
                            {order.status === "awaiting_payment" &&
                              order.payment_method === "bank_transfer" &&
                              order.bank_accounts && (
                                <div className="border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 p-3 rounded-lg">
                                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 text-sm">
                                    Payment Instructions
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p className="text-orange-700 dark:text-orange-300">
                                      Please transfer <strong>{formatCurrency(order.total_price)}</strong> to:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                      <div>
                                        <span className="font-medium">Bank:</span>
                                        <div className="font-mono">{order.bank_accounts.bank_name}</div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Account:</span>
                                        <div className="font-mono">{order.bank_accounts.account_number}</div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Name:</span>
                                        <div className="font-mono">{order.bank_accounts.account_name}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}