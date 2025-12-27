import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWalletFundingNotification, sendServiceOrderNotification, getActiveAdminEmails } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  console.log("🔍 Order payment confirmation API called");
  
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("👤 User authenticated:", user?.id);

    if (authError || !user) {
      console.log("❌ Authentication failed:", authError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();
    console.log("📦 Order ID received:", orderId);

    if (!orderId) {
      console.log("❌ Missing order ID");
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Verify the order belongs to the user and is in awaiting_payment status
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

    console.log("🔍 Order query result:", { order, error: orderError });

    if (orderError || !order) {
      console.log("❌ Order not found or access denied:", orderError);
      return NextResponse.json(
        { error: "Order not found or access denied" },
        { status: 404 }
      );
    }

    console.log("📋 Current order status:", order.status);

    if (order.status !== "awaiting_payment") {
      console.log("❌ Order is not in awaiting_payment status, current:", order.status);
      return NextResponse.json(
        { error: `Order is not in awaiting_payment status. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    if (order.payment_method !== "bank_transfer") {
      console.log("❌ Order is not a bank transfer payment:", order.payment_method);
      return NextResponse.json(
        { error: "This endpoint is only for bank transfer payments" },
        { status: 400 }
      );
    }

    // Update order status to awaiting_confirmation
    console.log("🔄 Updating order status to awaiting_confirmation...");
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "awaiting_confirmation",
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    console.log("📝 Update result:", { 
      updateError: updateError?.message,
      success: !updateError
    });

    if (updateError) {
      console.error("❌ Error updating order status:", updateError);
      return NextResponse.json(
        { error: `Failed to update order status: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log("✅ Order status updated successfully");

    // Get user details for email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("⚠️ Error fetching user data:", userError);
      // Don't fail the request if we can't get user data for email
    }

    // Send email notification to all active admins
    try {
      const adminEmails = await getActiveAdminEmails();
      console.log("📧 Sending email to admin(s):", adminEmails);
      
      if (adminEmails.length === 0) {
        console.log("⚠️ No admin emails found, skipping email notification");
      } else {
        const isWalletFunding = order.link === "wallet_funding";
        
        if (isWalletFunding) {
          // Use existing wallet funding notification
          await sendWalletFundingNotification({
            orderId: order.id,
            userEmail: userData?.email || "Unknown",
            userName: userData?.full_name || "Unknown User",
            amount: order.total_price,
            adminEmails,
          });
        } else {
          // Send service order notification
          await sendServiceOrderNotification({
            orderId: order.id,
            userEmail: userData?.email || "Unknown",
            userName: userData?.full_name || "Unknown User",
            amount: order.total_price,
            serviceName: `${order.services?.[0]?.platform || 'Unknown'} ${order.services?.[0]?.service_type || 'Service'}`,
            adminEmails,
          });
        }
        
        console.log("✅ Email notification sent successfully to all admins");
      }
    } catch (emailError) {
      console.error("⚠️ Failed to send admin notification email:", emailError);
      // Don't fail the request if email fails
    }

    console.log("🎉 Payment confirmation completed successfully");
    return NextResponse.json({ 
      success: true,
      message: "Payment confirmation sent to admin" 
    });
  } catch (error) {
    console.error("💥 Payment confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}