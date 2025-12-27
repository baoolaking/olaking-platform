import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

    console.log("🔍 Testing admin orders query...");

    // Test 1: Basic orders query
    const { data: basicOrders, error: basicError } = await supabase
      .from("orders")
      .select("id, order_number, user_id, created_at")
      .limit(5);

    console.log("🔍 Basic orders:", { basicOrders, basicError });

    // Test 2: Users query
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username, full_name, email")
      .limit(5);

    console.log("🔍 Users:", { users, usersError });

    // Test 3: Orders with users (left join)
    const { data: ordersWithUsers, error: joinError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        users (username, full_name, email)
      `)
      .limit(5);

    console.log("🔍 Orders with users:", { ordersWithUsers, joinError });

    // Test 4: Manual join
    if (basicOrders && users) {
      const manualJoin = basicOrders.map(order => ({
        ...order,
        user: users.find(u => u.id === order.user_id)
      }));
      console.log("🔍 Manual join result:", manualJoin);
    }

    return NextResponse.json({
      success: true,
      tests: {
        basicOrders: { data: basicOrders, error: basicError },
        users: { data: users, error: usersError },
        ordersWithUsers: { data: ordersWithUsers, error: joinError },
        userInfo: { id: user.id, email: user.email }
      }
    });
  } catch (error) {
    console.error("💥 Test error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}