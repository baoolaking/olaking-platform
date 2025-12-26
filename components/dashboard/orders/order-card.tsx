"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/wallet/utils";
import { formatPlatformName, formatServiceType } from "@/lib/validations/wallet";
import { PaymentConfirmationSection } from "./payment-confirmation-section";
import { AwaitingConfirmationSection } from "./awaiting-confirmation-section";

type OrderStatus =
  | "awaiting_payment"
  | "awaiting_confirmation"
  | "pending"
  | "completed"
  | "failed"
  | "awaiting_refund"
  | "refunded";

interface Order {
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

interface OrderCardProps {
  order: Order;
  onRefresh?: () => void;
}

const statusConfig: Record<OrderStatus, {
  color: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}> = {
  awaiting_payment: {
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
    icon: <Clock className="h-4 w-4" />,
    label: "Awaiting Payment",
    description: "Please complete your payment to process this order"
  },
  awaiting_confirmation: {
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    label: "Awaiting Confirmation",
    description: "We're verifying your payment confirmation"
  },
  pending: {
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    label: "Processing",
    description: "Your order is being processed"
  },
  completed: {
    color: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Completed",
    description: "Your order has been completed successfully"
  },
  failed: {
    color: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />,
    label: "Failed",
    description: "There was an issue with your order"
  },
  awaiting_refund: {
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
    icon: <AlertCircle className="h-4 w-4" />,
    label: "Awaiting Refund",
    description: "Refund is being processed"
  },
  refunded: {
    color: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
    icon: <RefreshCw className="h-4 w-4" />,
    label: "Refunded",
    description: "Amount has been refunded to your wallet"
  },
};

export function OrderCard({ order, onRefresh }: OrderCardProps) {
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>({});

  const statusInfo = statusConfig[order.status];
  const isWalletOrder = order.link === "wallet_funding" && !order.service_id;

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
      <Wallet className="h-4 w-4" />
    ) : (
      <CreditCard className="h-4 w-4" />
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
              {isWalletOrder ? (
                <>
                  <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Wallet Funding</span>
                </>
              ) : (
                <span className="break-words">
                  {formatPlatformName(order.services?.platform || "")} - {formatServiceType(order.services?.service_type || "")}
                </span>
              )}
            </CardTitle>
            <CardDescription className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <span className="break-all">Order ID: {order.id.slice(0, 8)}...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(order.id, `order_id_${order.id}`)}
                  className="h-5 w-5 p-0 hover:bg-muted"
                  title="Copy Order ID"
                >
                  {copiedItems[`order_id_${order.id}`] ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                {getPaymentMethodIcon(order.payment_method)}
                {order.payment_method === "wallet" ? "Wallet" : "Bank Transfer"}
              </span>
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`${statusInfo.color} flex items-center gap-1 flex-shrink-0 text-xs`}
          >
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Details Grid - More responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {!isWalletOrder && (
            <div className="col-span-1">
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="font-medium text-sm sm:text-base">
                {order.quantity.toLocaleString()}
              </p>
            </div>
          )}
          <div className={isWalletOrder ? "col-span-2 sm:col-span-1" : "col-span-1"}>
            <p className="text-xs text-muted-foreground">
              {isWalletOrder ? "Funding Amount" : "Total Price"}
            </p>
            <p className="font-medium text-sm sm:text-lg">
              {formatCurrency(order.total_price)}
            </p>
          </div>
          {!isWalletOrder && (
            <>
              <div className="col-span-1">
                <p className="text-xs text-muted-foreground">Quality</p>
                <p className="font-medium text-sm sm:text-base capitalize">
                  {order.quality_type.replace("_", " ")}
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-xs text-muted-foreground">Price per 1k</p>
                <p className="font-medium text-sm sm:text-base">
                  {formatCurrency(order.price_per_1k)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Status Description */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {statusInfo.description}
          </p>
        </div>

        {/* Payment Instructions for Bank Transfer */}
        {order.status === "awaiting_payment" && order.payment_method === "bank_transfer" && order.bank_accounts && (
          <div className="border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 text-sm sm:text-base">
              Payment Instructions
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-orange-700 dark:text-orange-300">
                Please transfer <strong>{formatCurrency(order.total_price)}</strong> to:
              </p>
              <div className="bg-white dark:bg-gray-900 p-3 rounded border space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Bank</p>
                    <p className="font-medium break-words text-sm">{order.bank_accounts.bank_name}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(order.bank_accounts!.bank_name, `bank_name_${order.id}`)}
                    className="h-7 w-7 p-0 flex-shrink-0"
                  >
                    {copiedItems[`bank_name_${order.id}`] ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Account Number</p>
                    <p className="font-medium font-mono break-all text-sm">{order.bank_accounts.account_number}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(order.bank_accounts!.account_number, `account_number_${order.id}`)}
                    className="h-7 w-7 p-0 flex-shrink-0"
                  >
                    {copiedItems[`account_number_${order.id}`] ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Account Name</p>
                    <p className="font-medium break-words text-sm">{order.bank_accounts.account_name}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(order.bank_accounts!.account_name, `account_name_${order.id}`)}
                    className="h-7 w-7 p-0 flex-shrink-0"
                  >
                    {copiedItems[`account_name_${order.id}`] ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Amount to Transfer</p>
                      <p className="font-bold text-orange-700 dark:text-orange-300 break-all text-sm">{formatCurrency(order.total_price)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(order.total_price.toString(), `amount_${order.id}`)}
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      {copiedItems[`amount_${order.id}`] ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                After payment, please wait for admin confirmation. We verify payments regularly.
              </p>
            </div>

            {/* Payment Confirmation Section */}
            <PaymentConfirmationSection
              orderId={order.id}
              amount={order.total_price}
              onStatusUpdate={onRefresh}
            />
          </div>
        )}

        {/* Awaiting Confirmation Section */}
        {order.status === "awaiting_confirmation" && order.payment_method === "bank_transfer" && (
          <AwaitingConfirmationSection
            orderId={order.id}
            amount={order.total_price}
            createdAt={order.created_at}
            onRefresh={onRefresh}
          />
        )}

        {/* Link (for service orders) */}
        {!isWalletOrder && order.link && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Target Link</p>
            <a
              href={order.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-start gap-1 break-all"
            >
              <span className="break-all">{order.link}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" />
            </a>
          </div>
        )}

        {/* Timestamps - More mobile friendly */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2 border-t">
          <span>
            Created: {new Date(order.created_at).toLocaleString()}
          </span>
          {order.completed_at && (
            <span>
              Completed: {new Date(order.completed_at).toLocaleString()}
            </span>
          )}
          {order.payment_verified_at && (
            <span>
              Payment Verified: {new Date(order.payment_verified_at).toLocaleString()}
            </span>
          )}
        </div>

        {/* Admin Notes */}
        {order.admin_notes && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              Admin Notes
            </p>
            <p className="text-sm">{order.admin_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}