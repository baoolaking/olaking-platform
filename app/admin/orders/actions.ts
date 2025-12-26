"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, extractAuditFields } from "@/lib/audit/logAdminAction";
import { sendOrderStatusNotification } from "@/lib/email/order-notifications";

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

  // Get current order data for audit log and email notification
  const { data: currentOrder, error: orderError } = await adminClient
    .from("orders")
    .select(`
      *,
      users!orders_user_id_fkey(email, full_name),
      services!orders_service_id_fkey(platform, service_type)
    `)
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

  // Send email notification to user if status changed
  if (newStatus !== currentOrder.status) {
    try {
      await sendOrderStatusNotification(newStatus, {
        orderId: orderId,
        userEmail: currentOrder.users.email,
        userName: currentOrder.users.full_name || 'Customer',
        orderDetails: {
          platform: currentOrder.services.platform,
          serviceType: currentOrder.services.service_type,
          quantity: currentOrder.quantity,
          totalPrice: currentOrder.total_price,
          link: currentOrder.link,
          paymentMethod: currentOrder.payment_method,
        },
        adminNotes: adminNotes,
      });
      
      console.log(`📧 Email notification sent for order ${orderId} status change: ${currentOrder.status} → ${newStatus}`);
    } catch (emailError) {
      console.error(`Failed to send email notification for order ${orderId}:`, emailError);
      // Don't fail the entire operation if email fails
    }
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