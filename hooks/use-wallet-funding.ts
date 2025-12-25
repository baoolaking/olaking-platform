"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { UserData, BankAccount } from "./use-wallet";

interface PendingPayment {
  order_id: string;
  amount: number;
  bank_account_id: string;
}

export function useWalletFunding(userData: UserData | null, onDataReload: () => void) {
  const supabase = createClient();
  const [isFunding, setIsFunding] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && pendingPayment) {
      interval = setInterval(checkPaymentStatus, 60000); // Poll every minute
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, pendingPayment]);

  const checkPaymentStatus = async () => {
    if (!pendingPayment) return;

    try {
      // Check if payment has been approved by admin
      const { data: orderData, error } = await supabase
        .from("orders")
        .select("status, payment_verified_at")
        .eq("id", pendingPayment.order_id)
        .single();

      if (error) throw error;

      if (orderData.status === "pending" && orderData.payment_verified_at) {
        // Payment approved, reload wallet data
        await onDataReload();
        setPendingPayment(null);
        setIsPolling(false);
        toast.success("Payment confirmed! Your wallet has been funded.");
      } else if (orderData.status === "failed") {
        // Payment rejected
        setPendingPayment(null);
        setIsPolling(false);
        toast.error("Payment was rejected. Please try again or contact support.");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const createFundingRequest = async (amount: number, bankAccountId: string, minFundingAmount: number) => {
    if (!userData) return;

    if (amount < minFundingAmount) {
      toast.error(`Minimum funding amount is ₦${minFundingAmount.toLocaleString()}`);
      return;
    }

    setIsFunding(true);
    try {
      // Create a wallet funding order
      const { data: orderResult, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userData.id,
          service_id: null, // Explicitly null for wallet funding
          quantity: 1, // Quantity = 1 for wallet funding (will be allowed after DB fix)
          price_per_1k: amount, // Store the funding amount here
          total_price: amount,
          status: "awaiting_payment",
          link: "wallet_funding", // Special identifier for wallet funding
          quality_type: "high_quality",
          payment_method: "bank_transfer",
          bank_account_id: bankAccountId,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Database error:", orderError);

        // Provide specific error messages for common issues
        if (orderError.code === "23502" && orderError.message.includes("service_id")) {
          throw new Error("Database configuration issue: Please contact support. The wallet funding feature requires a database update.");
        } else if (orderError.code === "23514" && orderError.message.includes("orders_quantity_check")) {
          throw new Error("Database configuration issue: Please contact support. The quantity constraint needs to be updated for wallet funding.");
        } else if (orderError.code === "23503") {
          throw new Error("Invalid bank account selected. Please try again.");
        } else {
          throw new Error(`Database error: ${orderError.message}`);
        }
      }

      // Set pending payment and start polling
      setPendingPayment({
        order_id: orderResult.id,
        amount: amount,
        bank_account_id: bankAccountId,
      });
      setIsPolling(true);

      toast.success("Funding request created! Please make the payment and wait for confirmation.");

      return true; // Success
    } catch (error) {
      console.error("Error creating funding request:", error);
      toast.error("Failed to create funding request", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      return false; // Failure
    } finally {
      setIsFunding(false);
    }
  };

  return {
    isFunding,
    isPolling,
    pendingPayment,
    createFundingRequest,
  };
}