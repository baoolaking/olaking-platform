import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTikTokPackages } from "./actions";
import { TikTokPackagesClient } from "@/components/admin/tiktok-packages/TikTokPackagesClient";

export const dynamic = "force-dynamic";

export default async function TikTokPackagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "sub_admin"].includes(userData.role)) {
    redirect("/dashboard");
  }

  const packages = await getTikTokPackages();

  return <TikTokPackagesClient initialPackages={packages} userRole={userData.role} />;
}
