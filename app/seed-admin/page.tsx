"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { seedSuperAdmin } from "./actions";

export default function SeedAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "olaitan@olaking.store",
    username: "olaitan_admin",
    whatsapp_no: "+2349017992518",
    full_name: "Super Admin",
    password: "Pa$$w0rd!",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("email", formData.email);
      data.append("username", formData.username);
      data.append("whatsapp_no", formData.whatsapp_no);
      data.append("full_name", formData.full_name);
      data.append("password", formData.password);

      await seedSuperAdmin(data);
      setMessage(
        "✅ Super admin created successfully! You can now login and delete this page."
      );
    } catch (error) {
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seed Super Admin</CardTitle>
          <CardDescription>
            Create the first super admin account for the platform. Delete this
            page after use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp_no}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_no: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Super Admin"}
            </Button>

            {message && (
              <div className="p-3 rounded-md bg-muted text-sm">{message}</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
