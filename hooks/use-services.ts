"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
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
        const { data: userDataResult, error: userError } = await supabase
          .from("users")
          .select("id, wallet_balance, full_name")
          .eq("id", user.id)
          .single();

        if (!userError && userDataResult) {
          setUserData(userDataResult);
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

      // Load user data
      const { data: userDataResult, error: userError } = await supabase
        .from("users")
        .select("id, wallet_balance, full_name")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      setUserData(userDataResult);

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

  return {
    isLoading,
    services,
    bankAccounts,
    userData,
    refreshUserData,
    loadData,
  };
}