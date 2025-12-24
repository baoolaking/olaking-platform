import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable } from "@/components/ui/responsive-table";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch all orders with user and service details
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      *,
      users (username, full_name, whatsapp_no),
      services (platform, service_type, price_per_1k)
    `
    )
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
  }

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const pendingOrders =
    orders?.filter((o) => o.status === "pending").length || 0;
  const completedOrders =
    orders?.filter((o) => o.status === "completed").length || 0;
  const awaitingPayment =
    orders?.filter((o) => o.status === "awaiting_payment").length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    awaiting_payment: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">
          View and manage all platform orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Awaiting Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{awaitingPayment}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            Complete list of all platform orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found</p>
          ) : (
            <ResponsiveTable
              columns={[
                {
                  key: "id",
                  label: "Order ID",
                  render: (id) => (
                    <span className="font-mono text-sm">
                      {(id as string).slice(0, 8)}
                    </span>
                  ),
                },
                {
                  key: "services",
                  label: "Service",
                  render: (services: any) => (
                    <div>
                      <p className="font-medium">{services?.platform}</p>
                      <p className="text-sm text-muted-foreground">
                        {services?.service_type}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "users",
                  label: "Customer",
                  render: (users: any) => (
                    <div>
                      <p className="font-medium">{users?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{users?.username}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "social_link",
                  label: "Link",
                  render: (link: any) => (
                    <span className="max-w-50 truncate text-sm">{link}</span>
                  ),
                },
                {
                  key: "quantity",
                  label: "Quantity",
                  render: (qty: any) => qty.toLocaleString(),
                },
                {
                  key: "total_amount",
                  label: "Amount",
                  render: (amount: any) => (
                    <span className="font-medium">
                      ₦{amount.toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (status: any) => (
                    <Badge variant="outline" className={statusColors[status]}>
                      {status.replace("_", " ").toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  key: "created_at",
                  label: "Date",
                  render: (date: any) => new Date(date).toLocaleDateString(),
                },
              ]}
              data={orders}
              keyField="id"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
