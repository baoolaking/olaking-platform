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

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch admin settings
  const { data: settings, error: settingsError } = await supabase
    .from("admin_settings")
    .select("*")
    .single();

  if (settingsError) {
    console.error("Error fetching settings:", settingsError);
  }

  // Fetch audit logs
  const { data: auditLogs, error: auditError } = await supabase
    .from("admin_audit_logs")
    .select("*, users (username, full_name)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (auditError) {
    console.error("Error fetching audit logs:", auditError);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings and view audit logs
        </p>
      </div>

      {/* Platform Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Core platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Platform Name</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.platform_name || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Support Email</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.support_email || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">WhatsApp Number</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.support_whatsapp || "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Settings</CardTitle>
            <CardDescription>Order processing configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Cancel Timeout</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.auto_cancel_hours || 0} hours
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Verification</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.payment_verification_hours || 0} hours
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
              </div>
              <Badge
                variant={settings?.is_maintenance ? "destructive" : "default"}
              >
                {settings?.is_maintenance ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Notice */}
      {settings?.is_maintenance && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Maintenance Mode Active
            </CardTitle>
            <CardDescription>
              The platform is currently in maintenance mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{settings.maintenance_message}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
          <CardDescription>
            Last 20 administrative actions on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!auditLogs || auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit logs found</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      by{" "}
                      {
                        (log.users as { full_name: string; username: string })
                          ?.full_name
                      }{" "}
                      (@
                      {
                        (log.users as { full_name: string; username: string })
                          ?.username
                      }
                      )
                    </p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
