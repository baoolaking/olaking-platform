"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit/logAdminAction";

export async function updateUserWallet(
  userId: string,
  orderId: string,
  amount: number,
  action: "add" | "subtract"
) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get current admin user
  const {
    data: { user: currentUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !currentUser) {
    throw new Error("Not authenticated");
  }

  // Get current admin user's role using admin client
  const { data: currentUserData } = await adminClient
    .from("users")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!currentUserData || !["super_admin", "sub_admin"].includes(currentUserData.role)) {
    throw new Error("Insufficient permissions");
  }

  // Get current wallet balance from users table using admin client
  const { data: userData, error: userError } = await adminClient
    .from("users")
    .select("wallet_balance, username, full_name")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Error fetching user wallet:", userError);
    throw new Error("Failed to fetch wallet balance");
  }

  if (!userData) {
    throw new Error("User not found");
  }

  const currentBalance = userData.wallet_balance;
  const newBalance = action === "add"
    ? currentBalance + amount
    : currentBalance - amount;

  if (newBalance < 0) {
    throw new Error("Insufficient wallet balance for subtraction");
  }

  // Update wallet balance in users table using admin client
  const { error: updateError } = await adminClient
    .from("users")
    .update({
      wallet_balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating wallet:", updateError);
    throw new Error("Failed to update wallet balance");
  }

  // Create wallet transaction record using admin client
  const { error: transactionError } = await adminClient
    .from("wallet_transactions")
    .insert({
      user_id: userId,
      transaction_type: action === "add" ? "credit" : "debit",
      amount: amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: `Admin ${action === "add" ? "credit" : "debit"} - Order ${orderId.slice(0, 8)}`,
      reference: `admin_${action}_${orderId}`,
      order_id: orderId,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    });

  if (transactionError) {
    console.error("Error creating transaction:", transactionError);
    // Don't throw here, wallet was updated successfully
  }

  // Log the admin action
  await logAdminAction({
    action: `${action.toUpperCase()}_WALLET_BALANCE`,
    entityType: "wallet",
    entityId: userId,
    oldValues: {
      wallet_balance: currentBalance,
      user: userData.username || userData.full_name,
    },
    newValues: {
      wallet_balance: newBalance,
      amount: amount,
      order_id: orderId,
      transaction_type: action === "add" ? "credit" : "debit",
    },
  });

  revalidatePath("/admin/orders");
  
  return {
    success: true,
    newBalance,
    message: `Wallet ${action === "add" ? "credited" : "debited"} successfully`
  };
}