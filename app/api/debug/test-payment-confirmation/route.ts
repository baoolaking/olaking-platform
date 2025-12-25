import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  console.log("🧪 DEBUG: Testing payment confirmation");
  
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("👤 DEBUG: User check:", { 
      userId: user?.id, 
      authError: authError?.message 
    });

    if (authError || !user) {
      return NextResponse.json({
        step: "authentication",
        success: false,
        error: "User not authenticated",
        details: authError?.message
      });
    }

    const { orderId } = await request.json();
    console.log("📦 DEBUG: Order ID:", orderId);

    if (!orderId) {
      return NextResponse.json({
        step: "validation",
        success: false,
        error: "Order ID is required"
      });
    }

    // Check if order exists and get its details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    console.log("🔍 DEBUG: Order query result:", { 
      order: order ? {
        id: order.id,
        user_id: order.user_id,
        status: order.status,
        link: order.link,
        total_price: order.total_price
      } : null,
      error: orderError?.message 
    });

    if (orderError || !order) {
      return NextResponse.json({
        step: "order_lookup",
        success: false,
        error: "Order not found",
        details: orderError?.message,
        orderId
      });
    }

    // Check ownership
    if (order.user_id !== user.id) {
      return NextResponse.json({
        step: "ownership_check",
        success: false,
        error: "Order does not belong to current user",
        orderUserId: order.user_id,
        currentUserId: user.id
      });
    }

    // Check if it's a wallet funding order
    if (order.link !== "wallet_funding") {
      return NextResponse.json({
        step: "order_type_check",
        success: false,
        error: "Order is not a wallet funding order",
        orderLink: order.link
      });
    }

    // Check current status
    if (order.status !== "awaiting_payment") {
      return NextResponse.json({
        step: "status_check",
        success: false,
        error: "Order is not in awaiting_payment status",
        currentStatus: order.status,
        note: "This might be okay if already confirmed"
      });
    }

    // Try to update the status (without select to avoid RLS issues)
    console.log("🔄 DEBUG: Attempting to update order status...");
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "awaiting_confirmation",
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    console.log("📝 DEBUG: Update result:", { 
      updateError: updateError?.message,
      success: !updateError
    });

    if (updateError) {
      return NextResponse.json({
        step: "database_update",
        success: false,
        error: "Failed to update order status",
        details: updateError.message,
        code: updateError.code
      });
    }

    // Verify the update worked by querying separately
    const { data: updatedOrder, error: verifyError } = await supabase
      .from("orders")
      .select("id, status, updated_at")
      .eq("id", orderId)
      .single();

    console.log("✅ DEBUG: Update successful, verification result:", { 
      updatedOrder, 
      verifyError: verifyError?.message 
    });

    return NextResponse.json({
      step: "complete",
      success: true,
      message: "Order status updated successfully",
      orderDetails: {
        id: orderId,
        oldStatus: order.status,
        newStatus: updatedOrder?.status || "awaiting_confirmation",
        updatedAt: updatedOrder?.updated_at
      },
      verification: updatedOrder
    });

  } catch (error) {
    console.error("💥 DEBUG: Unexpected error:", error);
    return NextResponse.json({
      step: "unexpected_error",
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}