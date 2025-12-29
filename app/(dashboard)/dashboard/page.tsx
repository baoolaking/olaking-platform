import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ShoppingBag, TrendingUp, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TikTokCoinBanner } from "@/components/common/TikTokCoinBanner";
import { TikTokCoinQuickAction } from "@/components/common/TikTokCoinQuickAction";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    redirect("/login");
  }

  // Fetch user's orders count
  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch user's pending orders
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* TikTok Coin Banner - Prominent at the top */}
      <TikTokCoinBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {userData.full_name}!
        </h1>
        <p className="text-muted-foreground">@{userData.username}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₦{userData.wallet_balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <Link
                href="/dashboard/wallet"
                className="text-primary hover:underline"
              >
                Fund wallet
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{ordersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Link
                href="/dashboard/orders"
                className="text-primary hover:underline"
              >
                View all orders
              </Link>
            </p>
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
            <div className="text-xl sm:text-2xl font-bold">{pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Orders being processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* TikTok Coins Quick Action */}
        <TikTokCoinQuickAction />

        {/* Existing Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Browse Services</CardTitle>
            <CardDescription>Explore all available services</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/services">
              <Button className="w-full" size="lg">
                Browse Services
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">View Orders</CardTitle>
            <CardDescription>Check your order history</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/orders">
              <Button className="w-full" variant="outline" size="lg">
                View Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium break-all">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium break-all">{userData.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">WhatsApp</p>
              <p className="font-medium break-all">{userData.whatsapp_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">
                {userData.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
