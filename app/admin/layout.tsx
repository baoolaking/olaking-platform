import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
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

  // Fetch user role and verify admin access
  const { data: userData } = await supabase
    .from("users")
    .select("role, full_name, username")
    .eq("id", user.id)
    .single();

  // Redirect non-admins to user dashboard
  if (
    !userData ||
    (userData.role !== "super_admin" && userData.role !== "sub_admin")
  ) {
    redirect("/dashboard");
  }

  return (
    <AdminShell userRole={userData.role} userName={userData.full_name}>
      {children}
    </AdminShell>
  );
}
