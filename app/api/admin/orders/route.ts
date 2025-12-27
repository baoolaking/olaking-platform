import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

    console.log("🔍 Fetching orders via server API...");

    // Try to fetch orders with users using server-side client
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        *,
        users!orders_user_id_fkey (
          username,
          full_name,
          whatsapp_no,
          email
        ),
        services (
          platform,
          service_type,
          price_per_1k
        )
      `)
      .order("created_at", { ascending: false });

    console.log("🔍 Server API query result:", { 
      ordersCount: ordersData?.length || 0, 
      error: ordersError,
      hasUserData: ordersData?.[0]?.users ? "Yes" : "No"
    });

    if (ordersError) {
      console.error("❌ Server API error:", ordersError);
      return NextResponse.json(
        { error: "Failed to fetch orders", details: ordersError },
        { status: 500 }
      );
    }

    // Check for missing user data and try to fix it
    if (ordersData) {
      const ordersWithoutUsers = ordersData.filter(order => !order.users);
      
      if (ordersWithoutUsers.length > 0) {
        console.log("⚠️ Server API: Found orders with missing user data:", ordersWithoutUsers.length);
        
        // Try to fetch users separately
        const missingUserIds = ordersWithoutUsers.map(order => order.user_id);
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, username, full_name, whatsapp_no, email")
          .in("id", missingUserIds);

        if (!usersError && usersData) {
          // Manually attach user data
          const fixedOrders = ordersData.map(order => {
            if (!order.users) {
              const userData = usersData.find(u => u.id === order.user_id);
              return { ...order, users: userData || null };
            }
            return order;
          });
          
          return NextResponse.json({ orders: fixedOrders });
        }
      }
    }

    return NextResponse.json({ orders: ordersData || [] });
  } catch (error) {
    console.error("💥 Server API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}