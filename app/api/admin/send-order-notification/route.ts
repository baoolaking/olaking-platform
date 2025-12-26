import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusNotification } from "@/lib/email/order-notifications";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
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

    const { orderId, status, adminNotes } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: orderId and status" },
        { status: 400 }
      );
    }

    // Get order data with user and service information
    const { data: orderData, error: orderError } = await adminClient
      .from("orders")
      .select(`
        *,
        users!orders_user_id_fkey(email, full_name),
        services!orders_service_id_fkey(platform, service_type)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Send email notification
    await sendOrderStatusNotification(status, {
      orderId: orderId,
      userEmail: orderData.users.email,
      userName: orderData.users.full_name || 'Customer',
      orderDetails: {
        platform: orderData.services.platform,
        serviceType: orderData.services.service_type,
        quantity: orderData.quantity,
        totalPrice: orderData.total_price,
        link: orderData.link,
        paymentMethod: orderData.payment_method,
      },
      adminNotes: adminNotes,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Email notification sent for order ${orderId} with status ${status}` 
    });

  } catch (error) {
    console.error("Error sending order notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}