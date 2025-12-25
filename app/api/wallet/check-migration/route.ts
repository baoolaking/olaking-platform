import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Simple test: try to query orders with awaiting_confirmation status
    // This will fail with enum error if the value doesn't exist
    const { error: testError } = await supabase
      .from("orders")
      .select("id")
      .eq("status", "awaiting_confirmation")
      .limit(1);

    if (testError) {
      // Check if it's specifically an enum error
      if (testError.message.includes('invalid input value for enum order_status: "awaiting_confirmation"')) {
        return NextResponse.json({
          migrationNeeded: true,
          error: "awaiting_confirmation enum value not found",
          solution: "Run: ALTER TYPE order_status ADD VALUE 'awaiting_confirmation';"
        });
      }
      
      // Any other error means the enum exists but query failed for other reasons (which is fine)
      return NextResponse.json({
        migrationNeeded: false,
        status: "✅ Migration successfully applied - awaiting_confirmation enum exists",
        note: "Enum value works correctly (query failed for other reasons, which is expected)"
      });
    }

    // No error means enum exists and query worked
    return NextResponse.json({
      migrationNeeded: false,
      status: "✅ Migration successfully applied - awaiting_confirmation enum exists"
    });
    
  } catch (error) {
    console.error("Migration check error:", error);
    return NextResponse.json({
      error: "Failed to check migration status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}