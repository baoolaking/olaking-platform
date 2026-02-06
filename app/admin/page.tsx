import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingBag, DollarSign, TrendingUp, Wallet } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  awaiting_payment: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  awaiting_confirmation: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  awaiting_refund: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch stats
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: awaitingPayment } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "awaiting_payment");

  // Fetch total revenue (sum of completed orders)
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_price")
    .eq("status", "completed");

  const totalRevenue =
    revenueData?.reduce(
      (sum, order) => sum + parseFloat(order.total_price),
      0
    ) || 0;

  // Fetch total wallet balance across all users
  const { data: walletData } = await supabase
    .from("users")
    .select("wallet_balance");

  const totalWalletBalance =
    walletData?.reduce(
      (sum, user) => sum + (user.wallet_balance || 0),
      0
    ) || 0;

  // Fetch recent orders using admin client to bypass RLS
  const { data: recentOrders, error: recentOrdersError } = await adminClient
    .from("orders")
    .select(
      `
      id,
      status,
      total_price,
      created_at,
      user_id,
      service_id,
      users!orders_user_id_fkey (
        username,
        full_name
      ),
      services (
        platform,
        service_type
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentOrdersError) {
    console.error("Error fetching recent orders:", recentOrdersError);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform statistics and activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Need processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{totalWalletBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All user balances</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Awaiting Payment</CardTitle>
            <CardDescription>
              Orders waiting for payment verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {awaitingPayment || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Requires admin verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing</CardTitle>
            <CardDescription>Orders being fulfilled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {pendingOrders || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              In progress orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from all users</CardDescription>
        </CardHeader>
        <CardContent>
          {!recentOrders || recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(
                (order: {
                  id: string;
                  users: { full_name: string; username: string } | null;
                  services: { platform: string; service_type: string } | null;
                  status: string;
                  total_price: number;
                  created_at: string | null;
                }) => (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {order.services?.platform?.toUpperCase()} -{" "}
                        {order.services?.service_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        by @{order.users?.username} •{" "}
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold">
                        ₦{order.total_price.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status] || ""}
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
