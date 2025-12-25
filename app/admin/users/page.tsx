export const dynamic = "force-dynamic";
export const revalidate = 0;
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersTableClient } from "@/components/admin/UsersTableClient";
import { UsersFilters } from "@/components/admin/UsersFilters";
import { UserForm } from "@/components/admin/UserForm";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    role?: string;
    status?: string;
  }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Unwrap searchParams (Next.js dynamic API)
  const sp = await searchParams;

  // Filters & pagination
  const page = Math.max(1, Number(sp?.page ?? "1") || 1);
  const perPage = 10;
  const q = (sp?.q ?? "").trim();
  const roleFilter = sp?.role ?? "all";
  const statusFilter = sp?.status ?? "all";

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (roleFilter !== "all") {
    query = query.eq("role", roleFilter);
  }
  if (statusFilter !== "all") {
    query = query.eq("is_active", statusFilter === "active");
  }
  if (q) {
    // Search across username, email, whatsapp_no, full_name
    query = query.or(
      `username.ilike.%${q}%,email.ilike.%${q}%,whatsapp_no.ilike.%${q}%,full_name.ilike.%${q}%`
    );
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data: users, error: usersError, count } = await query;

  if (usersError) {
    console.error("Error fetching users:", usersError);
  }

  // Get order counts for each user
  const userIds = users?.map((u) => u.id) || [];
  const { data: orderCounts } = await supabase
    .from("orders")
    .select("user_id")
    .in("user_id", userIds);

  const orderCountMap = orderCounts?.reduce(
    (acc: Record<string, number>, order: { user_id: string }) => {
      acc[order.user_id] = (acc[order.user_id] || 0) + 1;
      return acc;
    },
    {}
  );

  const roleColors: Record<string, string> = {
    user: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    sub_admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    super_admin: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  // Format users data for display
  const formattedUsers =
    users?.map((user) => ({
      ...user,
      displayRole: user.role.replace("_", " ").toUpperCase(),
      displayWallet: `₦${user.wallet_balance.toLocaleString()}`,
      displayOrders: orderCountMap?.[user.id] || 0,
      displayStatus: user.is_active ? "Active" : "Inactive",
      displayJoined: format(new Date(user.created_at), "do MMM. yyyy"),
      roleColor: roleColors[user.role],
    })) || [];

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (q) params.set("q", q);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    return `/admin/users?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage all platform users and their accounts
          </p>
        </div>
        {/* Quick add button */}
        <div className="hidden md:block">
          <UserForm />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter((u) => u.role === "user").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sub Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter((u) => u.role === "sub_admin").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter((u) => u.role === "super_admin").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage user accounts and permissions
              </CardDescription>
            </div>
            <div className="md:hidden">
              <UserForm />
            </div>
          </div>
          {/* Filters */}
          <UsersFilters q={q} role={roleFilter} status={statusFilter} />
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found</p>
          ) : (
            <UsersTableClient users={formattedUsers} currentUserId={user.id} />
          )}
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages} {total ? `• ${total} users` : ""}
            </span>
            <div className="flex gap-2">
              <Link
                aria-disabled={!hasPrev}
                className={`px-3 py-2 border rounded-md ${
                  hasPrev ? "" : "pointer-events-none opacity-50"
                }`}
                href={hasPrev ? buildHref(page - 1) : "#"}
              >
                Previous
              </Link>
              <Link
                aria-disabled={!hasNext}
                className={`px-3 py-2 border rounded-md ${
                  hasNext ? "" : "pointer-events-none opacity-50"
                }`}
                href={hasNext ? buildHref(page + 1) : "#"}
              >
                Next
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
