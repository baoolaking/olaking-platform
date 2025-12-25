"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function seedSuperAdmin(formData: FormData) {
  const adminClient = createAdminClient();

  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const whatsapp_no = formData.get("whatsapp_no") as string;
  const full_name = formData.get("full_name") as string;
  const password = formData.get("password") as string;

  // Create user with Supabase Admin API
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
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

  // Insert into public users table
  const { error: insertError } = await adminClient
    .from("users")
    .insert({
      id: authData.user.id,
      email,
      username,
      whatsapp_no,
      full_name,
      role: "super_admin",
      is_active: true,
      wallet_balance: 0,
    });

  if (insertError) {
    console.error("Error inserting user data:", insertError);
    throw new Error(insertError.message);
  }

  revalidatePath("/");
}
