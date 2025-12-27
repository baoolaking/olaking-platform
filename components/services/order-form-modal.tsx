"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  serviceOrderSchema,
  type ServiceOrderInput,
  formatPlatformName,
  formatServiceType,
} from "@/lib/validations/wallet";
import {
  checkSufficientBalance,
  calculateServicePrice,
  validateServiceQuantity,
  formatCurrency,
} from "@/lib/wallet/utils";
import { broadcastWalletUpdate } from "@/hooks/use-wallet-context";
import { useOptimisticWallet } from "@/hooks/use-optimistic-wallet";
import { Service, UserData, BankAccount } from "./types";

interface OrderFormModalProps {
  service: Service;
  userData: UserData | null;
  bankAccounts: BankAccount[];
  onClose: () => void;
  onSuccess: () => void;
  onRefreshUserData: () => void;
}

export function OrderFormModal({
  service,
  userData,
  bankAccounts,
  onClose,
  onSuccess,
  onRefreshUserData,
}: OrderFormModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOrdering, setIsOrdering] = useState(false);

  // Initialize optimistic wallet for better UX
  const {
    balance: displayBalance,
    isOptimistic,
    optimisticDeduct,
    confirmDeduction,
    revertOptimistic,
  } = useOptimisticWallet(userData?.wallet_balance || 0);

  // Create dynamic schema based on the selected service
  const dynamicSchema = serviceOrderSchema.extend({
    quantity: z
      .number()
      .min(service.min_quantity, `Minimum quantity is ${service.min_quantity.toLocaleString()}`)
      .max(service.max_quantity, `Maximum quantity is ${service.max_quantity.toLocaleString()}`)
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ServiceOrderInput>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      service_id: service.id,
      platform: service.platform as any,
      service_type: service.service_type,
      quantity: service.min_quantity,
      quality_type: "high_quality",
      payment_method: "wallet", // Only wallet payment supported for now
      // payment_method: userData && displayBalance > 0 ? "wallet" : "bank_transfer",
    }
  });

  const watchedQuantity = watch("quantity");
  const watchedPaymentMethod = watch("payment_method");

  useEffect(() => {
    if (service && watchedQuantity) {
      const calculatedPrice = calculateServicePrice(watchedQuantity, service.price_per_1k);
      // Update form with calculated price (for display purposes)
    }
  }, [service, watchedQuantity]);

  const onSubmit = async (data: ServiceOrderInput) => {
    if (!userData || !service) return;

    // Validate quantity
    const quantityValidation = validateServiceQuantity(
      data.quantity,
      service.min_quantity,
      service.max_quantity
    );

    if (!quantityValidation.isValid) {
      toast.error(quantityValidation.error);
      return;
    }

    // Calculate total price
    const totalPrice = calculateServicePrice(data.quantity, service.price_per_1k);

    // Check payment method requirements
    if (data.payment_method === "wallet") {
      const hasSufficientBalance = displayBalance >= totalPrice;
      if (!hasSufficientBalance) {
        toast.error("Insufficient wallet balance. Please fund your wallet first.");
        return;
      }
    }
    // Bank transfer temporarily disabled - only wallet payments supported
    // else if (data.payment_method === "bank_transfer" && !data.bank_account_id) {
    //   toast.error("Please select a bank account for payment.");
    //   return;
    // }

    setIsOrdering(true);

    // Optimistically deduct from wallet for better UX
    if (data.payment_method === "wallet") {
      optimisticDeduct(totalPrice);
    }

    try {
      // Create the order via API
      const createOrderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: data.service_id,
          quantity: data.quantity,
          price_per_1k: service.price_per_1k,
          total_price: totalPrice,
          status: data.payment_method === "wallet" ? "pending" : "awaiting_payment", // Only wallet supported for now
          link: data.link,
          quality_type: data.quality_type,
          payment_method: data.payment_method,
          bank_account_id: data.bank_account_id || null,
        }),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const createOrderResult = await createOrderResponse.json();
      const orderResult = createOrderResult.order;

      console.log("✅ Order created successfully:", orderResult.id);

      // If paying with wallet, deduct the amount
      if (data.payment_method === "wallet") {
        const deductResponse = await fetch("/api/wallet/deduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice,
            orderId: orderResult.id,
            description: `Payment for ${formatPlatformName(service.platform)} ${formatServiceType(service.service_type)}`,
          }),
        });

        if (!deductResponse.ok) {
          const errorData = await deductResponse.json();
          throw new Error(errorData.error || "Failed to process wallet payment");
        }

        // Get the updated wallet balance from the response
        const deductResult = await deductResponse.json();
        const newBalance = deductResult.newBalance;

        // Confirm the optimistic update with actual balance
        if (typeof newBalance === 'number') {
          confirmDeduction(newBalance);
        }

        toast.success("Order placed successfully! Payment deducted from wallet.", {
          icon: <CheckCircle2 className="h-5 w-5" />,
        });
      }

      // Bank transfer success message (commented out since only wallet is supported)
      // else {
      //   toast.success("Order created! Please make the payment to complete your order.", {
      //     icon: <CheckCircle2 className="h-5 w-5" />,
      //   });
      // }

      // Trigger a page refresh to update wallet balance and other data
      onRefreshUserData();

      // Also refresh the router cache for better UX
      router.refresh();

      onSuccess();

    } catch (error) {
      console.error("Error creating order:", error);

      // Revert optimistic update on error
      if (data.payment_method === "wallet") {
        revertOptimistic();
      }

      toast.error("Failed to create order", {
        description: error instanceof Error ? error.message : "Please try again",
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const getLinkLabel = () => {
    if (service.service_type.includes('profile')) return 'Profile URL';
    if (service.service_type.includes('video')) return 'Video URL';
    if (service.service_type.includes('post')) return 'Post URL';
    return 'Content URL';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            Order {formatPlatformName(service.platform)} {formatServiceType(service.service_type)}
          </CardTitle>
          <CardDescription>
            Fill in the details for your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="link">{getLinkLabel()}</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://..."
                  {...register("link")}
                  disabled={isOrdering}
                />
                {errors.link && (
                  <p className="text-sm text-destructive">
                    {errors.link.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={service.min_quantity}
                  max={service.max_quantity}
                  {...register("quantity", { valueAsNumber: true })}
                  disabled={isOrdering}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Min: {service.min_quantity.toLocaleString()} - Max: {service.max_quantity.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality_type">Quality</Label>
                <Select
                  value={watch("quality_type") || "high_quality"}
                  onValueChange={(value) => setValue("quality_type", value as "high_quality" | "low_quality")}
                  disabled={isOrdering}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="high_quality">High Quality</SelectItem>
                    <SelectItem value="low_quality">Low Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value="wallet" // Only wallet payment supported for now
                  onValueChange={(value) => setValue("payment_method", value as "wallet" | "bank_transfer")}
                  disabled={true} // Disabled since only wallet is supported
                >
                  <SelectTrigger className="text-left">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {userData && displayBalance >= 0 && (
                      <SelectItem value="wallet">
                        <div className="flex flex-col">
                          <span>Wallet {isOptimistic && "(updating...)"}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(displayBalance)}
                          </span>
                        </div>
                      </SelectItem>
                    )}
                    {/* Bank transfer temporarily disabled */}
                    {/* <SelectItem value="bank_transfer">Bank Transfer</SelectItem> */}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only wallet payments are currently supported
                </p>
              </div>
            </div>

            {/* Bank transfer section temporarily disabled - only wallet payments supported */}
            {/* {watchedPaymentMethod === "bank_transfer" && (
              <div className="space-y-2">
                <Label htmlFor="bank_account_id">Select Bank Account</Label>
                <Select
                  value={watch("bank_account_id") || ""}
                  onValueChange={(value) => setValue("bank_account_id", value)}
                  disabled={isOrdering}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose bank account..." />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex flex-col">
                          <span className="truncate">
                            {account.bank_name} - {account.account_number}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {account.account_name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bank_account_id && (
                  <p className="text-sm text-destructive">
                    {errors.bank_account_id.message}
                  </p>
                )}
              </div>
            )} */}

            {/* Price Display */}
            {watchedQuantity && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(calculateServicePrice(watchedQuantity, service.price_per_1k))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {watchedQuantity.toLocaleString()} × {formatCurrency(service.price_per_1k)}/1k
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isOrdering} className="flex-1">
                {isOrdering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isOrdering}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}