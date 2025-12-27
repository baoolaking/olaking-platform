"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction, extractAuditFields } from "@/lib/audit/logAdminAction";

export async function createUser(formData: FormData) {
  const adminClient = createAdminClient();
  const supabase = await createClient();

  // Get current user's role for permission check
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const { data: currentUserData } = await supabase
    .from("users")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (!currentUserData) {
    throw new Error("Unable to verify user permissions");
  }

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

  // Sub admins can only create regular users
  if (currentUserData.role === "sub_admin" && 
      (role === "sub_admin" || role === "super_admin")) {
    throw new Error("You don't have permission to create admin accounts");
  }

  // Check if email already exists
  const { data: existingUser } = await adminClient.auth.admin.listUsers();
  const emailExists = existingUser.users.some(user => user.email === email);
  
  if (emailExists) {
    throw new Error("A user with this email already exists");
  }

  // Check if username is already taken using database function
  const { data: usernameCheck, error: usernameError } = await adminClient
    .rpc('is_username_taken', { p_username: username });

  if (usernameError) {
    console.error("Error checking username:", usernameError);
    throw new Error("Failed to validate username");
  }

  if (usernameCheck) {
    throw new Error("Username is already taken");
  }

  // Check if WhatsApp number is already taken using database function
  const { data: whatsappCheck, error: whatsappError } = await adminClient
    .rpc('is_whatsapp_taken', { p_whatsapp: whatsapp_no });

  if (whatsappError) {
    console.error("Error checking WhatsApp:", whatsappError);
    throw new Error("Failed to validate WhatsApp number");
  }

  if (whatsappCheck) {
    throw new Error("WhatsApp number is already registered");
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
    
    // Provide more specific error messages
    if (authError.message.includes('already registered')) {
      throw new Error("A user with this email is already registered");
    } else if (authError.message.includes('invalid email')) {
      throw new Error("Please provide a valid email address");
    } else if (authError.message.includes('password')) {
      throw new Error("Password does not meet requirements");
    } else {
      throw new Error(`Failed to create user: ${authError.message}`);
    }
  }

  if (!authData.user) {
    throw new Error("Failed to create user");
  }

  // The handle_new_user() trigger should have created a basic user record
  // Use our custom function to properly set up the user with admin fields
  const { data: createResult, error: createUserError } = await adminClient
    .rpc('create_admin_user', {
      p_auth_user_id: authData.user.id,
      p_email: email,
      p_username: username,
      p_whatsapp_no: whatsapp_no,
      p_full_name: full_name,
      p_role: role,
      p_is_active: is_active,
      p_bank_account_name: bank_account_name || undefined,
      p_bank_account_number: bank_account_number || undefined,
      p_bank_name: bank_name || undefined,
    });

  if (createUserError) {
    console.error("Error creating user profile:", createUserError);
    throw new Error(createUserError.message);
  }

  // Log the admin action
  await logAdminAction({
    action: "CREATE_USER",
    entityType: "user",
    entityId: authData.user.id,
    newValues: await extractAuditFields({
      email,
      username,
      whatsapp_no,
      full_name,
      role,
      is_active,
      bank_account_name: bank_account_name || null,
      bank_account_number: bank_account_number || null,
      bank_name: bank_name || null,
    }, [
      "email",
      "username",
      "whatsapp_no",
      "full_name",
      "role",
      "is_active",
      "bank_account_name",
      "bank_account_number",
      "bank_name"
    ]),
  });

  revalidatePath("/admin/users");
}

export async function updateUser(id: string, formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Not authenticated");
  }

  if (authUser.id === id) {
    throw new Error("You cannot edit your own account.");
  }

  // Get current user's role using admin client to bypass RLS
  const { data: currentUserData } = await adminClient
    .from("users")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (!currentUserData) {
    throw new Error("Unable to verify user permissions");
  }

  // Get target user's data using admin client (for old values and role check)
  const { data: targetUserData } = await adminClient
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!targetUserData) {
    throw new Error("Target user not found");
  }

  // Sub admins can only edit regular users
  if (currentUserData.role === "sub_admin" && 
      (targetUserData.role === "sub_admin" || targetUserData.role === "super_admin")) {
    throw new Error("You don't have permission to edit admin accounts");
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

  // Sub admins cannot assign admin roles
  if (currentUserData.role === "sub_admin" && 
      (role === "sub_admin" || role === "super_admin")) {
    throw new Error("You don't have permission to assign admin roles");
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

  // Use admin client for the update to bypass RLS
  const { error } = await adminClient
    .from("users")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating user:", error);
    throw new Error(error.message);
  }

  // Log the admin action
  const auditFields = [
    "email",
    "username", 
    "whatsapp_no",
    "full_name",
    "role",
    "is_active",
    "bank_account_name",
    "bank_account_number",
    "bank_name",
    "wallet_balance"
  ];

  await logAdminAction({
    action: "UPDATE_USER",
    entityType: "user",
    entityId: id,
    oldValues: await extractAuditFields(targetUserData, auditFields),
    newValues: await extractAuditFields(updateData, auditFields),
  });

  revalidatePath("/admin/users");
}

export async function deactivateUser(id: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Not authenticated");
  }

  if (authUser.id === id) {
    throw new Error("You cannot deactivate your own account.");
  }

  // Get current user's role using admin client
  const { data: currentUserData } = await adminClient
    .from("users")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (!currentUserData) {
    throw new Error("Unable to verify user permissions");
  }

  // Get target user's data using admin client
  const { data: targetUserData } = await adminClient
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!targetUserData) {
    throw new Error("Target user not found");
  }

  // Sub admins cannot deactivate admin accounts
  if (currentUserData.role === "sub_admin" && 
      (targetUserData.role === "sub_admin" || targetUserData.role === "super_admin")) {
    throw new Error("You don't have permission to deactivate admin accounts");
  }

  // Use admin client for the update
  const { error } = await adminClient
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

  // Log the admin action
  await logAdminAction({
    action: "DEACTIVATE_USER",
    entityType: "user",
    entityId: id,
    oldValues: {
      is_active: targetUserData.is_active,
      username: targetUserData.username,
      full_name: targetUserData.full_name,
    },
    newValues: {
      is_active: false,
    },
  });

  revalidatePath("/admin/users");
}
