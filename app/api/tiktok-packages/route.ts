import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/tiktok-packages
 * Public endpoint to fetch active TikTok coin packages
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: packages, error } = await supabase
      .from("tiktok_coin_packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching TikTok packages:", error);
      return NextResponse.json(
        { error: "Failed to fetch packages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ packages: packages || [] });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
