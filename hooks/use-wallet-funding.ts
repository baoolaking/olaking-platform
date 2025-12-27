"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { UserData, BankAccount } from "./use-wallet";

interface PendingPayment {
  order_id: string;
  order_number: string;
  amount: number;
  bank_account_id: string;
  status?: string; // Track the current status
}

export function useWalletFunding(userData: UserData | null, onDataReload: () => void) {
  const supabase = createClient();
  const [isFunding, setIsFunding] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false); // Track if user has confirmed payment

  // Check for existing pending payments on mount
  useEffect(() => {
    if (userData && !pendingPayment) {
      checkForExistingPendingPayment();
    }
  }, [userData]);

  const checkForExistingPendingPayment = async () => {
    if (!userData) return;

    try {
      const { data: existingOrders, error } = await supabase
        .from("orders")
        .select("id, order_number, total_price, bank_account_id, status")
        .eq("user_id", userData.id)
        .eq("link", "wallet_funding")
        .in("status", ["awaiting_payment", "awaiting_confirmation"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.log("Error checking for existing orders:", error);
        return;
      }

      // Check if we have any orders
      if (existingOrders && existingOrders.length > 0) {
        const existingOrder = existingOrders[0];
        setPendingPayment({
          order_id: existingOrder.id,
          order_number: existingOrder.order_number,
          amount: existingOrder.total_price,
          bank_account_id: existingOrder.bank_account_id,
          status: existingOrder.status,
        });
        setIsPolling(true);
        setIsConfirmed(existingOrder.status === "awaiting_confirmation");
        console.log("Found existing pending payment:", existingOrder);
      } else {
        console.log("No existing pending payments found");
      }
    } catch (error) {
      console.log("Error in checkForExistingPendingPayment:", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && pendingPayment) {
      // Poll every 10 seconds instead of 60 seconds for faster updates
      interval = setInterval(checkPaymentStatus, 10000);
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

      if (orderData.status === "pending") {
        // Order moved to pending (either manually by admin or auto-timeout)
        // Stop polling and hide waiting state, but keep showing the order in orders page
        await onDataReload(); // Refresh wallet data to show any new transactions
        setPendingPayment(null);
        setIsPolling(false);
        setIsConfirmed(false);
        toast.success("Payment moved to pending! Admin will verify and credit your wallet soon.");
      } else if (orderData.status === "completed") {
        // Payment completed, reload wallet data
        await onDataReload();
        setPendingPayment(null);
        setIsPolling(false);
        setIsConfirmed(false);
        toast.success("Payment completed! Your wallet has been funded.");
      } else if (orderData.status === "failed") {
        // Payment rejected
        setPendingPayment(null);
        setIsPolling(false);
        setIsConfirmed(false);
        toast.error("Payment was rejected. Please try again or contact support.");
      } else if (orderData.status === "awaiting_confirmation") {
        // User has confirmed payment, admin needs to verify
        // Update the pending payment status
        setPendingPayment(prev => prev ? { ...prev, status: "awaiting_confirmation" } : null);
        setIsConfirmed(true);
        console.log("Payment confirmation sent to admin, waiting for verification...");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const handlePaymentConfirmed = () => {
    // This is called when user clicks "I've sent the money"
    // Update the local state to show waiting UI
    setIsConfirmed(true);
    setPendingPayment(prev => prev ? { ...prev, status: "awaiting_confirmation" } : null);
    toast.info("Payment confirmation sent! Admin will verify and credit your wallet soon.");
  };

  const refreshPaymentStatus = async () => {
    if (pendingPayment) {
      await checkPaymentStatus();
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
        .select("id, order_number")
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
        order_number: orderResult.order_number,
        amount: amount,
        bank_account_id: bankAccountId,
        status: "awaiting_payment",
      });
      setIsPolling(true);
      setIsConfirmed(false); // Reset confirmation state

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
    isConfirmed,
    createFundingRequest,
    handlePaymentConfirmed,
    refreshPaymentStatus,
  };
}