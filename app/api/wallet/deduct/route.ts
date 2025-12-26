import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Wallet Deduct API Called ===");
    
    const supabase = await createClient();
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", user.id);

    const body = await request.json();
    console.log("Request body:", body);
    
    const { amount, orderId, description } = body;

    if (!amount || !orderId || !description) {
      console.error("Missing fields:", { amount, orderId, description });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Attempting database function call...");

    // Try using the database function first
    try {
      console.log("Trying main deduct_from_wallet function...");
      const { data, error } = await supabase.rpc("deduct_from_wallet", {
        p_user_id: user.id,
        p_amount: amount,
        p_order_id: orderId,
        p_description: description,
      });

      console.log("Main function result:", { data, error });

      if (error) {
        throw error;
      }

      if (!data) {
        console.log("Insufficient balance returned from main function");
        return NextResponse.json(
          { error: "Insufficient wallet balance" },
          { status: 400 }
        );
      }

      console.log("Main database function succeeded");
      
      // Revalidate pages that show wallet balance
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/services");
      revalidatePath("/dashboard/wallet");
      revalidatePath("/dashboard/profile");
      revalidatePath("/admin/users");
      
      return NextResponse.json({ success: true });
    } catch (functionError) {
      console.log("Main function failed, trying simple function:", functionError);
      
      // Try the simpler function
      try {
        console.log("Trying deduct_from_wallet_simple function...");
        const { data: simpleData, error: simpleError } = await supabase.rpc("deduct_from_wallet_simple", {
          p_user_id: user.id,
          p_amount: amount,
          p_order_id: orderId,
          p_description: description,
        });

        console.log("Simple function result:", { simpleData, simpleError });

        if (simpleError) {
          throw simpleError;
        }

        if (!simpleData) {
          console.log("Insufficient balance returned from simple function");
          return NextResponse.json(
            { error: "Insufficient wallet balance" },
            { status: 400 }
          );
        }

        console.log("Simple database function succeeded");
        
        // Revalidate pages that show wallet balance
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/services");
        revalidatePath("/dashboard/wallet");
        revalidatePath("/dashboard/profile");
        revalidatePath("/admin/users");
        
        return NextResponse.json({ success: true });
      } catch (simpleFunctionError) {
        console.log("Simple function also failed, trying manual approach:", simpleFunctionError);
      }
      
      // Fallback: Manual wallet deduction using admin client (bypasses RLS)
      console.log("Getting user balance with admin client...");
      
      const adminClient = createAdminClient();
      
      const { data: userData, error: userError } = await adminClient
        .from("users")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      console.log("User data result:", { userData, userError });

      if (userError || !userData) {
        console.error("User fetch error:", userError);
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const currentBalance = userData.wallet_balance || 0;
      console.log("Current balance:", currentBalance, "Required:", amount);

      // Check sufficient balance
      if (currentBalance < amount) {
        console.log("Insufficient balance");
        return NextResponse.json(
          { error: "Insufficient wallet balance" },
          { status: 400 }
        );
      }

      const newBalance = currentBalance - amount;
      console.log("New balance will be:", newBalance);

      // Update wallet balance using admin client (bypasses RLS)
      console.log("Updating user balance with admin client...");
      const { error: updateError } = await adminClient
        .from("users")
        .update({ 
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      console.log("Balance update result:", { updateError });

      if (updateError) {
        console.error("Balance update failed:", updateError);
        throw updateError;
      }

      // Create transaction record using admin client
      console.log("Creating transaction record with admin client...");
      const { error: transactionError } = await adminClient
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          transaction_type: "debit",
          amount: amount,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: description,
          order_id: orderId,
          created_at: new Date().toISOString()
        });

      console.log("Transaction record result:", { transactionError });

      if (transactionError) {
        console.error("Failed to create transaction record:", transactionError);
        // Don't fail the whole operation if transaction record fails
      }

      console.log("Manual wallet deduction completed successfully with admin client");
      
      // Revalidate pages that show wallet balance
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/services");
      revalidatePath("/dashboard/wallet");
      revalidatePath("/dashboard/profile");
      revalidatePath("/admin/users");
      
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("=== Wallet deduction error ===", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}