"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PasswordChangeForm } from "@/components/common/PasswordChangeForm";

interface AdminSettings {
  platform_name?: string;
  support_email?: string;
  support_whatsapp?: string;
  auto_cancel_hours?: number;
  payment_verification_hours?: number;
  is_maintenance?: boolean;
  maintenance_message?: string;
}

interface AuditLog {
  id: string;
  action: string;
  details?: any;
  created_at: string;
  users: {
    full_name: string;
    username: string;
  };
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);

      // Fetch admin settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("admin_settings")
        .select("*")
        .single();

      if (settingsError) {
        console.error("Error fetching settings:", settingsError);
      } else {
        setSettings(settingsData);
      }

      // Fetch audit logs
      const { data: auditLogsData, error: auditError } = await supabase
        .from("admin_audit_logs")
        .select("*, users (username, full_name)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (auditError) {
        console.error("Error fetching audit logs:", auditError);
      } else {
        setAuditLogs(auditLogsData || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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

      {/* Admin Password Change Section */}
      <PasswordChangeForm
        userEmail={currentUser?.email || ""}
        title="Change Admin Password"
        description="Update your admin password to keep your account secure"
      />

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
                      by {log.users?.full_name} (@{log.users?.username})
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
