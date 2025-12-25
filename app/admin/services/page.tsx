import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServicesTable } from "@/components/admin/ServicesTable";
import { ServiceForm } from "@/components/admin/ServiceForm";

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const platformIconMap: Record<string, string> = {
    tiktok: "/images/platforms/tiktok.svg",
    instagram: "/images/platforms/instagram.svg",
    facebook: "/images/platforms/facebook.svg",
    youtube: "/images/platforms/youtube.svg",
    x: "/images/platforms/x.svg",
    twitter: "/images/platforms/x.svg",
    telegram: "/images/platforms/telegram.svg",
    whatsapp: "/images/platforms/whatsapp.svg",
  };

  const renderPlatformChip = (platformRaw: string) => {
    const platform = platformRaw?.toLowerCase();
    const icon = platformIconMap[platform];

    return (
      <div className="flex items-center gap-2">
        {icon ? (
          <Image
            src={icon}
            alt={`${platformRaw} icon`}
            width={28}
            height={28}
            className="h-7 w-7 dark:invert"
          />
        ) : (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
            {platformRaw?.slice(0, 2) || "?"}
          </span>
        )}
        <span className="font-medium capitalize">{platformRaw}</span>
      </div>
    );
  };

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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {Object.entries(platformGroups || {}).map(([platform, count]) => (
          <Card key={platform}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {renderPlatformChip(platform)}
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
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <CardTitle>All Services</CardTitle>
            <CardDescription>
              Complete list of all available services
            </CardDescription>
          </div>
          <ServiceForm existingServices={services || []} />
        </CardHeader>
        <CardContent>
          {!services || services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No services found</p>
            </div>
          ) : (
            <ServicesTable services={services} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
