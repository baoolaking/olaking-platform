"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, extractAuditFields } from "@/lib/audit/logAdminAction";

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  adminNotes: string
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

  // Get current admin user's role
  const { data: currentUserData } = await adminClient
    .from("users")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!currentUserData || !["super_admin", "sub_admin"].includes(currentUserData.role)) {
    throw new Error("Insufficient permissions");
  }

  // Get current order data for audit log
  const { data: currentOrder, error: orderError } = await adminClient
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !currentOrder) {
    throw new Error("Order not found");
  }

  const updateData: any = {
    status: newStatus,
    admin_notes: adminNotes || null,
    updated_at: new Date().toISOString(),
  };

  // Set timestamps based on status
  if (newStatus === "completed" && currentOrder.status !== "completed") {
    updateData.completed_at = new Date().toISOString();
  }
  if (newStatus === "pending" && currentOrder.payment_method === "bank_transfer") {
    updateData.payment_verified_at = new Date().toISOString();
  }

  const { error } = await adminClient
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  // Log the admin action
  await logAdminAction({
    action: "UPDATE_ORDER_STATUS",
    entityType: "order",
    entityId: orderId,
    oldValues: await extractAuditFields(currentOrder, [
      "status",
      "admin_notes",
      "completed_at",
      "payment_verified_at"
    ]),
    newValues: await extractAuditFields(updateData, [
      "status", 
      "admin_notes",
      "completed_at",
      "payment_verified_at"
    ]),
  });

  revalidatePath("/admin/orders");
  
  return { success: true };
}