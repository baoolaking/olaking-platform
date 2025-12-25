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

    console.log("🧪 Testing different update methods for order:", orderId);

    // Method 1: Simple update with just ID
    console.log("🧪 Method 1: Simple update with ID only");
    const { data: method1Result, error: method1Error } = await supabase
      .from("orders")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select("id, status, updated_at");

    console.log("Method 1 result:", { method1Result, method1Error });

    // Method 2: Update with multiple conditions
    console.log("🧪 Method 2: Update with multiple conditions");
    const { data: method2Result, error: method2Error } = await supabase
      .from("orders")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", user.id)
      .eq("status", "awaiting_payment")
      .select("id, status, updated_at");

    console.log("Method 2 result:", { method2Result, method2Error });

    // Method 3: Try to update status specifically
    console.log("🧪 Method 3: Update status to awaiting_confirmation");
    const { data: method3Result, error: method3Error } = await supabase
      .from("orders")
      .update({ 
        status: "awaiting_confirmation",
        updated_at: new Date().toISOString() 
      })
      .eq("id", orderId)
      .eq("user_id", user.id)
      .select("id, status, updated_at");

    console.log("Method 3 result:", { method3Result, method3Error });

    // Method 4: Check RLS by trying admin client
    console.log("🧪 Method 4: Testing with service role (bypass RLS)");
    const adminSupabase = await createClient();
    // Note: This would need service role key to truly bypass RLS
    const { data: method4Result, error: method4Error } = await adminSupabase
      .from("orders")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select("id, status, updated_at");

    console.log("Method 4 result:", { method4Result, method4Error });

    // Method 5: Try without select to see if that's the issue
    console.log("🧪 Method 5: Update without select");
    const { error: method5Error } = await supabase
      .from("orders")
      .update({ 
        status: "awaiting_confirmation",
        updated_at: new Date().toISOString() 
      })
      .eq("id", orderId)
      .eq("user_id", user.id);

    console.log("Method 5 result:", { method5Error });

    // Method 6: Check if the row still exists after our attempts
    console.log("🧪 Method 6: Verify order still exists");
    const { data: verifyOrder, error: verifyError } = await supabase
      .from("orders")
      .select("id, status, updated_at, user_id")
      .eq("id", orderId)
      .single();

    console.log("Method 6 result:", { verifyOrder, verifyError });

    return NextResponse.json({
      success: true,
      orderId,
      userId: user.id,
      testResults: {
        method1: {
          description: "Simple update with ID only",
          result: method1Result,
          error: method1Error?.message,
          rowsAffected: method1Result?.length || 0
        },
        method2: {
          description: "Update with multiple conditions",
          result: method2Result,
          error: method2Error?.message,
          rowsAffected: method2Result?.length || 0
        },
        method3: {
          description: "Update status to awaiting_confirmation",
          result: method3Result,
          error: method3Error?.message,
          rowsAffected: method3Result?.length || 0
        },
        method4: {
          description: "Test with admin client",
          result: method4Result,
          error: method4Error?.message,
          rowsAffected: method4Result?.length || 0
        },
        method5: {
          description: "Update without select",
          error: method5Error?.message,
          success: !method5Error
        },
        method6: {
          description: "Verify order still exists",
          result: verifyOrder,
          error: verifyError?.message
        }
      }
    });

  } catch (error) {
    console.error("Update methods test error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}