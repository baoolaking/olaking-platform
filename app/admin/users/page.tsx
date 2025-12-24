import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { RoleCell, StatusCell } from "@/components/admin/user-cells";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch all users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

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
      displayJoined: new Date(user.created_at).toLocaleDateString(),
      roleColor: roleColors[user.role],
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage all platform users and their accounts
          </p>
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
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found</p>
          ) : (
            <ResponsiveTable
              columns={[
                { key: "full_name", label: "User", isPrimary: true },
                { key: "email", label: "Email" },
                { key: "whatsapp_no", label: "WhatsApp" },
                {
                  key: "displayRole",
                  label: "Role",
                  render: (_, row: Record<string, unknown>) => (
                    <RoleCell
                      role={String(row.displayRole)}
                      roleColor={String(row.roleColor)}
                    />
                  ),
                },
                { key: "displayWallet", label: "Wallet" },
                { key: "displayOrders", label: "Orders" },
                {
                  key: "displayStatus",
                  label: "Status",
                  render: (status: unknown) => (
                    <StatusCell status={String(status)} />
                  ),
                },
                { key: "displayJoined", label: "Joined" },
              ]}
              data={formattedUsers}
              keyField="id"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
