"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBankAccount(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const bankName = formData.get("bank_name") as string;
  const accountName = formData.get("account_name") as string;
  const accountNumber = formData.get("account_number") as string;
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase.from("bank_accounts").insert({
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
    is_active: isActive,
  });

  if (error) {
    throw new Error(`Failed to create bank account: ${error.message}`);
  }

  revalidatePath("/admin/bank-accounts");
}

export async function updateBankAccount(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const bankName = formData.get("bank_name") as string;
  const accountName = formData.get("account_name") as string;
  const accountNumber = formData.get("account_number") as string;
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase
    .from("bank_accounts")
    .update({
      bank_name: bankName,
      account_name: accountName,
      account_number: accountNumber,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update bank account: ${error.message}`);
  }

  revalidatePath("/admin/bank-accounts");
}

export async function deleteBankAccount(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("bank_accounts").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete bank account: ${error.message}`);
  }

  revalidatePath("/admin/bank-accounts");
}
