import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if order exists with detailed info
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId);

    console.log("🔍 Order lookup result:", { orders, error: orderError });

    if (orderError) {
      return NextResponse.json({
        success: false,
        error: "Database error",
        details: orderError.message
      });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Order not found",
        orderId,
        note: "No order exists with this ID"
      });
    }

    const order = orders[0];

    // Check all conditions
    const checks = {
      orderExists: !!order,
      correctUser: order.user_id === user.id,
      isWalletFunding: order.link === "wallet_funding",
      currentStatus: order.status,
      canUpdate: order.status === "awaiting_payment"
    };

    return NextResponse.json({
      success: true,
      orderId,
      currentUserId: user.id,
      order: {
        id: order.id,
        user_id: order.user_id,
        status: order.status,
        link: order.link,
        total_price: order.total_price,
        created_at: order.created_at,
        updated_at: order.updated_at
      },
      checks,
      canProceed: checks.orderExists && checks.correctUser && checks.isWalletFunding && checks.canUpdate
    });

  } catch (error) {
    console.error("Check order error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}