import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || !["super_admin", "sub_admin"].includes(userData.role)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { userId, amount, description, orderId } = await request.json();

    if (!userId || !amount || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the database function to credit wallet
    const { data, error } = await supabase.rpc("credit_wallet", {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
      p_order_id: orderId || null,
      p_created_by: user.id,
    });

    if (error) {
      console.error("Error crediting wallet:", error);
      return NextResponse.json(
        { error: "Failed to credit wallet" },
        { status: 500 }
      );
    }

    // Get updated wallet balance to return to client
    const { data: updatedUser, error: balanceError } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    const newBalance = updatedUser?.wallet_balance || 0;

    // Revalidate pages that show wallet balance
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/profile");
    revalidatePath("/admin/users");

    return NextResponse.json({ 
      success: true, 
      newBalance,
      message: "Wallet credited successfully"
    });
  } catch (error) {
    console.error("Wallet credit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}