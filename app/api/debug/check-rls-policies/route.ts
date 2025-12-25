import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("🔍 Checking RLS policies for user:", user.id);

    // Try to check what policies exist (this might not work depending on permissions)
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'orders' });

    console.log("Policies result:", { policies, policiesError });

    // Test different update scenarios
    const testResults = [];

    // Test 1: Try updating with just the user condition
    console.log("🧪 Test 1: Update with user_id condition");
    const { error: test1Error } = await supabase
      .from("orders")
      .update({ updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("link", "wallet_funding")
      .eq("status", "awaiting_payment");

    testResults.push({
      test: "Update with user_id + link + status conditions",
      success: !test1Error,
      error: test1Error?.message
    });

    // Test 2: Try a simple field update
    console.log("🧪 Test 2: Update just updated_at field");
    const { error: test2Error } = await supabase
      .from("orders")
      .update({ updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("link", "wallet_funding");

    testResults.push({
      test: "Update just updated_at field",
      success: !test2Error,
      error: test2Error?.message
    });

    // Test 3: Check if we can read our own orders
    console.log("🧪 Test 3: Check read permissions");
    const { data: readTest, error: readError } = await supabase
      .from("orders")
      .select("id, status, user_id")
      .eq("user_id", user.id)
      .eq("link", "wallet_funding")
      .limit(1);

    testResults.push({
      test: "Read own orders",
      success: !readError,
      error: readError?.message,
      data: readTest
    });

    // Test 4: Try to update status specifically
    console.log("🧪 Test 4: Try to update status field specifically");
    const { error: test4Error } = await supabase
      .from("orders")
      .update({ status: "awaiting_confirmation" })
      .eq("user_id", user.id)
      .eq("link", "wallet_funding")
      .eq("status", "awaiting_payment");

    testResults.push({
      test: "Update status field specifically",
      success: !test4Error,
      error: test4Error?.message
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      policies: policies || "Could not retrieve policies",
      policiesError: policiesError?.message,
      testResults
    });

  } catch (error) {
    console.error("RLS check error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}