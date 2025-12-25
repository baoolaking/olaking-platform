"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAdminAction, extractAuditFields } from "@/lib/audit/logAdminAction";

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

  const newBankAccount = {
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
    is_active: isActive,
  };

  const { data, error } = await supabase
    .from("bank_accounts")
    .insert(newBankAccount)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create bank account: ${error.message}`);
  }

  // Log the admin action
  await logAdminAction({
    action: "CREATE_BANK_ACCOUNT",
    entityType: "bank_account",
    entityId: data.id,
    newValues: await extractAuditFields(newBankAccount, [
      "bank_name",
      "account_name", 
      "account_number",
      "is_active"
    ]),
  });

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

  // Get old values for audit log
  const { data: oldData } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("id", id)
    .single();

  const bankName = formData.get("bank_name") as string;
  const accountName = formData.get("account_name") as string;
  const accountNumber = formData.get("account_number") as string;
  const isActive = formData.get("is_active") === "on";

  const newValues = {
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
    is_active: isActive,
  };

  const { error } = await supabase
    .from("bank_accounts")
    .update(newValues)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update bank account: ${error.message}`);
  }

  // Log the admin action
  await logAdminAction({
    action: "UPDATE_BANK_ACCOUNT",
    entityType: "bank_account",
    entityId: id,
    oldValues: oldData ? await extractAuditFields(oldData, [
      "bank_name",
      "account_name",
      "account_number", 
      "is_active"
    ]) : undefined,
    newValues: await extractAuditFields(newValues, [
      "bank_name",
      "account_name",
      "account_number",
      "is_active"
    ]),
  });

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

  // Get old values for audit log before deletion
  const { data: oldData } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("bank_accounts").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete bank account: ${error.message}`);
  }

  // Log the admin action
  await logAdminAction({
    action: "DELETE_BANK_ACCOUNT",
    entityType: "bank_account",
    entityId: id,
    oldValues: oldData ? await extractAuditFields(oldData, [
      "bank_name",
      "account_name",
      "account_number",
      "is_active"
    ]) : undefined,
  });

  revalidatePath("/admin/bank-accounts");
}
