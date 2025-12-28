"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useWalletUpdates } from "@/hooks/use-wallet-context";
import { Service, BankAccount, UserData } from "@/components/services/types";

export function useServices() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  const refreshUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Store previous balance to detect changes
        const previousBalance = userData?.wallet_balance || 0;

        const { data: userDataResult, error: userError } = await supabase
          .from("users")
          .select("id, wallet_balance, full_name, whatsapp_no")
          .eq("id", user.id)
          .single();

        if (!userError && userDataResult) {
          setUserData(userDataResult);

          // Check if wallet balance changed and broadcast update
          if (userDataResult.wallet_balance !== previousBalance) {
            console.log(`Services page: Wallet balance changed from ${previousBalance} to ${userDataResult.wallet_balance}`);
            // Import dynamically to avoid circular dependencies
            const { broadcastWalletUpdate } = await import("@/hooks/use-wallet-context");
            broadcastWalletUpdate(userDataResult.wallet_balance);
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

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
        .select("id, wallet_balance, full_name, whatsapp_no")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      setUserData(userDataResult);

      // Check if wallet balance changed and broadcast update
      if (userDataResult && userDataResult.wallet_balance !== previousBalance) {
        console.log(`Services page: Initial wallet balance loaded: ${userDataResult.wallet_balance}`);
        // Import dynamically to avoid circular dependencies
        const { broadcastWalletUpdate } = await import("@/hooks/use-wallet-context");
        broadcastWalletUpdate(userDataResult.wallet_balance);
      }

      // Load active services
      const { data: servicesResult, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("platform", { ascending: true })
        .order("service_type", { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesResult || []);

      // Load bank accounts
      const { data: bankAccountsResult, error: bankError } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (bankError) throw bankError;
      setBankAccounts(bankAccountsResult || []);

    } catch (error) {
      console.error("Error loading services data:", error);
      toast.error("Failed to load services data");
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
      // Refresh signal - reload user data
      refreshUserData();
    } else if (userData) {
      // Direct balance update
      setUserData({
        ...userData,
        wallet_balance: newBalance
      });
    }
  });

  return {
    isLoading,
    services,
    bankAccounts,
    userData,
    refreshUserData,
    loadData,
  };
}