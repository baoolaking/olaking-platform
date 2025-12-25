import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if awaiting_confirmation enum value exists
    const { data: enumValues, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'order_status' });
    
    if (enumError) {
      console.error("Error checking enum values:", enumError);
      // Fallback: try to create a test order to see what happens
      return NextResponse.json({
        error: "Could not check enum values directly",
        enumError: enumError.message,
        suggestion: "Try running the migration manually"
      });
    }

    // Also check recent wallet funding orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, link, created_at")
      .eq("link", "wallet_funding")
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      enumValues,
      recentOrders: orders,
      ordersError: ordersError?.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug check error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Also create a simple test endpoint to try updating an order
export async function POST() {
  try {
    const supabase = await createClient();
    
    // Try to create a test order with awaiting_confirmation status
    const testOrder = {
      user_id: "test-user-id",
      service_id: null,
      quantity: 1,
      price_per_1k: 1000,
      total_price: 1000,
      status: "awaiting_confirmation" as const,
      link: "wallet_funding",
      quality_type: "high_quality" as const,
      payment_method: "bank_transfer" as const,
      bank_account_id: "test-bank-id"
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(testOrder)
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: "Failed to create test order",
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }

    // Clean up - delete the test order
    await supabase.from("orders").delete().eq("id", data.id);

    return NextResponse.json({
      success: true,
      message: "awaiting_confirmation enum value works correctly",
      testOrderId: data.id
    });
  } catch (error) {
    console.error("Test order creation error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}