import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    const { status, reason } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Verify the order belongs to the user and is in awaiting_confirmation status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id, 
        user_id, 
        status, 
        total_price, 
        link, 
        payment_method,
        services(platform, service_type)
      `)
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found or access denied" },
        { status: 404 }
      );
    }

    if (order.status !== "awaiting_confirmation") {
      return NextResponse.json(
        { error: `Order is not in awaiting_confirmation status. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update order status to pending with auto-update reason
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: status,
        admin_notes: reason === 'auto_confirmation_timeout' 
          ? 'Automatically moved to pending after confirmation timeout' 
          : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error auto-updating order status:", updateError);
      return NextResponse.json(
        { error: `Failed to update order status: ${updateError.message}` },
        { status: 500 }
      );
    }

    // For wallet funding orders moving to pending, create a transaction record
    // This shows the funding request in the user's transaction history
    if (order.link === "wallet_funding" && status === "pending") {
      try {
        console.log(`Creating transaction record for wallet funding order ${order.id} moving to pending`);
        
        // Use database function to create pending transaction record
        // This function runs with elevated privileges to bypass RLS
        const { data: transactionCreated, error: transactionError } = await supabase.rpc(
          'create_pending_wallet_transaction',
          {
            p_user_id: user.id,
            p_amount: order.total_price,
            p_order_id: order.id,
            p_description: `Wallet funding pending admin verification - Order ${order.id.slice(0, 8)}`
          }
        );

        if (transactionError) {
          console.error("Error creating pending transaction record:", transactionError);
          // Don't fail the request if transaction creation fails
        } else if (transactionCreated) {
          console.log(`✅ Pending transaction record created for wallet funding order ${order.id}`);
        } else {
          console.log(`⚠️ Pending transaction creation returned false for order ${order.id}`);
        }
      } catch (transactionCreationError) {
        console.error("Error in pending transaction creation:", transactionCreationError);
        // Don't fail the request if transaction creation fails
      }
    }

    // Revalidate relevant paths for real-time updates
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard");

    console.log(`Order ${orderId} auto-updated to ${status} status`);
    
    return NextResponse.json({ 
      success: true,
      message: `Order automatically updated to ${status}`,
      orderId,
      newStatus: status
    });
  } catch (error) {
    console.error("Auto-update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}