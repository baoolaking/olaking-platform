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

export default async function AdminServicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch all services
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("*")
    .order("platform", { ascending: true });

  if (servicesError) {
    console.error("Error fetching services:", servicesError);
  }

  // Get order counts for each service
  const serviceIds = services?.map((s) => s.id) || [];
  const { data: orderCounts } = await supabase
    .from("orders")
    .select("service_id")
    .in("service_id", serviceIds);

  const orderCountMap = orderCounts?.reduce(
    (acc: Record<string, number>, order: { service_id: string }) => {
      acc[order.service_id] = (acc[order.service_id] || 0) + 1;
      return acc;
    },
    {}
  );

  // Calculate stats
  const totalServices = services?.length || 0;
  const activeServices = services?.filter((s) => s.is_active).length || 0;
  const inactiveServices = totalServices - activeServices;

  const platformGroups = services?.reduce(
    (acc: Record<string, number>, service: { platform: string }) => {
      acc[service.platform] = (acc[service.platform] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Services Management</h1>
        <p className="text-muted-foreground">
          Manage all platform services and pricing
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(platformGroups || {}).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(platformGroups || {}).map(([platform, count]) => (
          <Card key={platform}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {platform}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {count as number} services
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>
            Complete list of all available services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!services || services.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services found</p>
          ) : (
            <ResponsiveTable
              columns={[
                {
                  key: "platform",
                  label: "Platform",
                  render: (platform: any) => (
                    <span className="font-medium capitalize">{platform}</span>
                  ),
                },
                {
                  key: "service_type",
                  label: "Service Type",
                  render: (type: any) => (
                    <span className="capitalize">{type}</span>
                  ),
                },
                {
                  key: "description",
                  label: "Description",
                  render: (desc: any) => (
                    <span className="text-sm text-muted-foreground">
                      {desc || "—"}
                    </span>
                  ),
                },
                {
                  key: "price_per_1k",
                  label: "Price/1K",
                  render: (price: any) => (
                    <span className="font-medium">
                      ₦{price.toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "min_quantity",
                  label: "Min",
                  render: (qty: any) => qty.toLocaleString(),
                },
                {
                  key: "max_quantity",
                  label: "Max",
                  render: (qty: any) => qty.toLocaleString(),
                },
                {
                  key: "id",
                  label: "Orders",
                  render: (serviceId: any) => orderCountMap?.[serviceId] || 0,
                },
                {
                  key: "is_active",
                  label: "Status",
                  render: (isActive: any) => (
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  ),
                },
              ]}
              data={services}
              keyField="id"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
