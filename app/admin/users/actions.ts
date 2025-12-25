"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function createUser(formData: FormData) {
  const adminClient = createAdminClient();

  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const whatsapp_no = formData.get("whatsapp_no") as string;
  const full_name = formData.get("full_name") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "user" | "sub_admin" | "super_admin";
  const is_active = formData.get("is_active") === "on";
  const bank_account_name = formData.get("bank_account_name") as string;
  const bank_account_number = formData.get("bank_account_number") as string;
  const bank_name = formData.get("bank_name") as string;

  if (!email || !username || !whatsapp_no || !full_name || !password || !role) {
    throw new Error("All required fields must be filled");
  }

  // Create user with Supabase Admin API (doesn't create a session)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for admin-created users
    user_metadata: {
      username,
      whatsapp_no,
      full_name,
    },
  });

  if (authError) {
    console.error("Error creating auth user:", authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("Failed to create user");
  }

  // Insert into public users table (trigger may not fire with admin.createUser)
  const { error: insertError } = await adminClient
    .from("users")
    .insert({
      id: authData.user.id,
      email,
      username,
      whatsapp_no,
      full_name,
      role,
      is_active,
      bank_account_name: bank_account_name || null,
      bank_account_number: bank_account_number || null,
      bank_name: bank_name || null,
      wallet_balance: 0,
    });

  if (insertError) {
    console.error("Error inserting user data:", insertError);
    // If insert fails, try update (in case trigger did fire)
    const { error: updateError } = await adminClient
      .from("users")
      .update({
        role,
        is_active,
        bank_account_name: bank_account_name || null,
        bank_account_number: bank_account_number || null,
        bank_name: bank_name || null,
        wallet_balance: 0,
      })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Error updating user data:", updateError);
      throw new Error(updateError.message);
    }
  }

  revalidatePath("/admin/users");
}

export async function updateUser(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Not authenticated");
  }

  if (authUser.id === id) {
    throw new Error("You cannot edit your own account.");
  }

  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const whatsapp_no = formData.get("whatsapp_no") as string;
  const full_name = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const is_active = formData.get("is_active") === "on";
  const bank_account_name = formData.get("bank_account_name") as string;
  const bank_account_number = formData.get("bank_account_number") as string;
  const bank_name = formData.get("bank_name") as string;
  const wallet_balance = formData.get("wallet_balance")
    ? Number(formData.get("wallet_balance"))
    : undefined;

  if (!email || !username || !whatsapp_no || !full_name || !role) {
    throw new Error("All required fields must be filled");
  }

  const updateData: Record<string, unknown> = {
    email,
    username,
    whatsapp_no,
    full_name,
    role,
    is_active,
    bank_account_name: bank_account_name || null,
    bank_account_number: bank_account_number || null,
    bank_name: bank_name || null,
    updated_at: new Date().toISOString(),
  };

  if (wallet_balance !== undefined) {
    updateData.wallet_balance = wallet_balance;
  }

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating user:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}

export async function deactivateUser(id: string) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Not authenticated");
  }

  if (authUser.id === id) {
    throw new Error("You cannot deactivate your own account.");
  }

  const { error } = await supabase
    .from("users")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error deactivating user:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}
