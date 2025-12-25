import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    const { amount, orderId, description } = await request.json();

    if (!amount || !orderId || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the database function to deduct from wallet
    const { data, error } = await supabase.rpc("deduct_from_wallet", {
      p_user_id: user.id,
      p_amount: amount,
      p_order_id: orderId,
      p_description: description,
    });

    if (error) {
      console.error("Error deducting from wallet:", error);
      return NextResponse.json(
        { error: "Failed to deduct from wallet" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wallet deduction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}