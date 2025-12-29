import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { TikTokCoinFloatingButton } from "@/components/common/TikTokCoinFloatingButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch user role and wallet balance
  const { data: userData } = await supabase
    .from("users")
    .select("role, full_name, wallet_balance, whatsapp_no")
    .eq("id", user.id)
    .single();

  return (
    <>
      <DashboardShell
        userRole={userData?.role}
        fullName={userData?.full_name}
        walletBalance={userData?.wallet_balance}
      >
        {children}
      </DashboardShell>

      {/* Floating TikTok Coin Button */}
      <TikTokCoinFloatingButton
        position="bottom-right"
      />
    </>
  );
}
