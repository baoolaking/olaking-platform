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

  // Handle wallet funding orders - automatically credit wallet when marked as completed
  if (currentOrder.link === "wallet_funding" && newStatus === "completed" && currentOrder.status !== "completed") {
    try {
      console.log(`Auto-crediting wallet for funding order ${orderId}: ₦${currentOrder.total_price}`);
      
      // First, check if there's already a pending transaction record for this order
      const { data: existingTransaction, error: transactionCheckError } = await adminClient
        .from("wallet_transactions")
        .select("id, balance_before, balance_after")
        .eq("order_id", orderId)
        .eq("user_id", currentOrder.user_id)
        .single();

      if (transactionCheckError && transactionCheckError.code !== 'PGRST116') {
        console.error("Error checking for existing transaction:", transactionCheckError);
      }

      if (existingTransaction) {
        console.log(`Found existing pending transaction ${existingTransaction.id}, updating instead of creating new one`);
        
        // Get current wallet balance
        const { data: currentUserData, error: balanceError } = await adminClient
          .from("users")
          .select("wallet_balance")
          .eq("id", currentOrder.user_id)
          .single();

        if (balanceError) {
          throw new Error(`Failed to get current balance: ${balanceError.message}`);
        }

        const newBalance = currentUserData.wallet_balance + currentOrder.total_price;

        // Update user's wallet balance
        const { error: walletUpdateError } = await adminClient
          .from("users")
          .update({
            wallet_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentOrder.user_id);

        if (walletUpdateError) {
          throw new Error(`Failed to update wallet balance: ${walletUpdateError.message}`);
        }

        // Update the existing transaction record
        const { error: transactionUpdateError } = await adminClient
          .from("wallet_transactions")
          .update({
            balance_after: newBalance,
            description: `Wallet funding completed - Order ${orderId.slice(0, 8)}`,
            reference: `funding_completed_${orderId}`,
            created_by: currentUser.id,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingTransaction.id);

        if (transactionUpdateError) {
          // Revert wallet balance if transaction update fails
          await adminClient
            .from("users")
            .update({
              wallet_balance: currentUserData.wallet_balance,
              updated_at: new Date().toISOString()
            })
            .eq("id", currentOrder.user_id);
          
          throw new Error(`Failed to update transaction record: ${transactionUpdateError.message}`);
        }

        console.log(`✅ Updated existing transaction ${existingTransaction.id} and credited wallet`);
      } else {
        console.log("No existing pending transaction found, using credit_wallet function");
        
        // Use the credit_wallet database function as fallback
        const { error: creditError } = await adminClient.rpc('credit_wallet', {
          p_user_id: currentOrder.user_id,
          p_amount: currentOrder.total_price,
          p_description: `Wallet funding completed - Order ${orderId.slice(0, 8)}`,
          p_order_id: orderId,
          p_reference: `funding_completed_${orderId}`,
          p_created_by: currentUser.id
        });

        if (creditError) {
          throw new Error(`Failed to credit wallet: ${creditError.message}`);
        }

        console.log(`✅ Wallet credited via credit_wallet function for order ${orderId}`);
      }

      // Revert the order status update if wallet operations fail
    } catch (walletError) {
      console.error("Wallet crediting error:", walletError);
      
      // Revert the order status update
      await adminClient
        .from("orders")
        .update({
          status: currentOrder.status,
          admin_notes: `Failed to credit wallet: ${walletError instanceof Error ? walletError.message : 'Unknown error'}`,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);
      
      throw new Error(`Order status updated but wallet crediting failed: ${walletError instanceof Error ? walletError.message : 'Unknown error'}`);
    }
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