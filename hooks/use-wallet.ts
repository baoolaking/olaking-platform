"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useWalletUpdates } from "@/hooks/use-wallet-context";

export interface UserData {
  id: string;
  email: string;
  username: string;
  full_name: string;
  wallet_balance: number;
}

export interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  is_active: boolean;
}

export interface WalletTransaction {
  id: string;
  transaction_type: 'credit' | 'debit' | 'refund';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference?: string;
  order_id?: string;
  created_at: string;
}

export function useWallet() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [minFundingAmount, setMinFundingAmount] = useState(500);

  const loadData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      // Store previous balance to detect changes
      const previousBalance = userData?.wallet_balance || 0;

      // Load user data
      const { data: userDataResult, error: userError } = await supabase
        .from("users")
        .select("id, email, username, full_name, wallet_balance")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      setUserData(userDataResult);

      // Check if wallet balance changed and broadcast update
      if (userDataResult && userDataResult.wallet_balance !== previousBalance) {
        console.log(`Wallet balance changed from ${previousBalance} to ${userDataResult.wallet_balance}`);
        // Import dynamically to avoid circular dependencies
        const { broadcastWalletUpdate } = await import("@/hooks/use-wallet-context");
        broadcastWalletUpdate(userDataResult.wallet_balance);
      }

      // Load bank accounts
      const { data: bankAccountsResult, error: bankError } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (bankError) throw bankError;
      setBankAccounts(bankAccountsResult || []);

      // Load wallet transactions
      const { data: transactionsResult, error: transactionError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (transactionError) throw transactionError;
      setTransactions(transactionsResult || []);

      // Load minimum funding amount
      const { data: settingsResult } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "min_wallet_funding")
        .single();

      if (settingsResult?.setting_value) {
        setMinFundingAmount(parseInt(settingsResult.setting_value));
      }

    } catch (error) {
      console.error("Error loading wallet data:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen for wallet balance updates
  useWalletUpdates((newBalance) => {
    if (newBalance === -1) {
      // Refresh signal - reload all data
      loadData();
    } else if (userData) {
      // Direct balance update
      setUserData({
        ...userData,
        wallet_balance: newBalance
      });
    }
  });

  return {
    userData,
    bankAccounts,
    transactions,
    minFundingAmount,
    isLoading,
    loadData,
  };
}