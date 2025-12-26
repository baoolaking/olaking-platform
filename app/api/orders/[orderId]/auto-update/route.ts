import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
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

    const { orderId } = await params;
    const { status, reason } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Verify the order belongs to the user and is in awaiting_confirmation status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id, 
        user_id, 
        status, 
        total_price, 
        link, 
        payment_method,
        services(platform, service_type)
      `)
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found or access denied" },
        { status: 404 }
      );
    }

    if (order.status !== "awaiting_confirmation") {
      return NextResponse.json(
        { error: `Order is not in awaiting_confirmation status. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update order status to pending with auto-update reason
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: status,
        admin_notes: reason === 'auto_confirmation_timeout' 
          ? 'Automatically processed after confirmation timeout' 
          : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error auto-updating order status:", updateError);
      return NextResponse.json(
        { error: `Failed to update order status: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Handle wallet funding - credit the user's wallet
    if (order.link === "wallet_funding" && status === "pending") {
      try {
        // Credit wallet using the existing wallet credit function
        const { error: creditError } = await supabase.rpc('credit_wallet', {
          user_id: user.id,
          amount: order.total_price
        });

        if (creditError) {
          console.error("Error crediting wallet:", creditError);
          // Revert order status if wallet credit fails
          await supabase
            .from("orders")
            .update({ 
              status: "awaiting_confirmation",
              admin_notes: "Auto-processing failed: wallet credit error",
              updated_at: new Date().toISOString()
            })
            .eq("id", orderId);
          
          return NextResponse.json(
            { error: "Failed to credit wallet" },
            { status: 500 }
          );
        }

        // Update order to completed for wallet funding
        await supabase
          .from("orders")
          .update({ 
            status: "completed",
            completed_at: new Date().toISOString(),
            admin_notes: "Automatically processed and wallet credited",
            updated_at: new Date().toISOString()
          })
          .eq("id", orderId);

        console.log(`Wallet funding order ${orderId} auto-completed and credited ₦${order.total_price}`);
      } catch (walletError) {
        console.error("Wallet credit error:", walletError);
        return NextResponse.json(
          { error: "Failed to process wallet funding" },
          { status: 500 }
        );
      }
    }

    // Revalidate relevant paths for real-time updates
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard");

    console.log(`Order ${orderId} auto-updated to ${status} status`);
    
    return NextResponse.json({ 
      success: true,
      message: `Order automatically updated to ${status}`,
      orderId,
      newStatus: order.link === "wallet_funding" && status === "pending" ? "completed" : status
    });
  } catch (error) {
    console.error("Auto-update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}