import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendServiceOrderNotification, getActiveAdminEmails } from "@/lib/email/service";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Order creation API called");
    
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

    const orderData = await request.json();
    console.log("📦 Order data received:", orderData);

    const {
      service_id,
      quantity,
      price_per_1k,
      total_price,
      status,
      link,
      quality_type,
      payment_method,
      bank_account_id,
    } = orderData;

    // Validate required fields
    if (!service_id || !quantity || !price_per_1k || !total_price || !status || !link || !quality_type || !payment_method) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user details for email notification
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.log("❌ Failed to get user data:", userError);
      return NextResponse.json(
        { error: "Failed to get user data" },
        { status: 500 }
      );
    }

    // Get service details for email notification
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .select("platform, service_type")
      .eq("id", service_id)
      .single();

    if (serviceError || !serviceData) {
      console.log("❌ Failed to get service data:", serviceError);
      return NextResponse.json(
        { error: "Failed to get service data" },
        { status: 500 }
      );
    }

    // Create the order
    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        service_id,
        quantity,
        price_per_1k,
        total_price,
        status,
        link,
        quality_type,
        payment_method,
        bank_account_id: bank_account_id || null,
      })
      .select()
      .single();

    if (orderError) {
      console.log("❌ Failed to create order:", orderError);
      throw orderError;
    }

    console.log("✅ Order created successfully:", orderResult.id);

    // Send email notification to admins for bank transfer orders
    if (payment_method === "bank_transfer") {
      try {
        console.log("📧 Sending admin notification for bank transfer order...");
        
        const adminEmails = await getActiveAdminEmails();
        
        if (adminEmails.length > 0) {
          const serviceName = serviceData 
            ? `${serviceData.platform} ${serviceData.service_type}`.replace(/_/g, ' ')
            : 'Unknown Service';
          
          await sendServiceOrderNotification({
            orderId: orderResult.order_number || orderResult.id,
            userEmail: userData.email,
            userName: userData.full_name || "Unknown User",
            amount: total_price,
            serviceName: serviceName,
            paymentMethod: 'bank_transfer',
            adminEmails,
          });
          
          console.log("✅ Admin notification sent successfully");
        } else {
          console.log("⚠️ No admin emails found, skipping notification");
        }
      } catch (emailError) {
        console.error("❌ Failed to send admin notification:", emailError);
        // Don't fail the order creation if email fails
      }
    }

    // Send email notification to admins for wallet orders (immediate processing needed)
    if (payment_method === "wallet") {
      try {
        console.log("📧 Sending admin notification for wallet order...");
        
        const adminEmails = await getActiveAdminEmails();
        
        if (adminEmails.length > 0) {
          const serviceName = serviceData 
            ? `${serviceData.platform} ${serviceData.service_type}`.replace(/_/g, ' ')
            : 'Unknown Service';
          
          await sendServiceOrderNotification({
            orderId: orderResult.order_number || orderResult.id,
            userEmail: userData.email,
            userName: userData.full_name || "Unknown User",
            amount: total_price,
            serviceName: serviceName,
            paymentMethod: 'wallet',
            adminEmails,
          });
          
          console.log("✅ Admin notification sent for wallet order");
        } else {
          console.log("⚠️ No admin emails found, skipping notification");
        }
      } catch (emailError) {
        console.error("❌ Failed to send admin notification:", emailError);
        // Don't fail the order creation if email fails
      }
    }

    // Revalidate pages that show orders
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    revalidatePath("/admin/orders");

    return NextResponse.json({
      success: true,
      order: orderResult,
      message: "Order created successfully"
    });

  } catch (error) {
    console.error("❌ Order creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}