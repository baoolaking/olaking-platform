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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type OrderStatus =
  | "awaiting_payment"
  | "pending"
  | "completed"
  | "failed"
  | "awaiting_refund"
  | "refunded";

const statusColors: Record<OrderStatus, string> = {
  awaiting_payment: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  pending: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  awaiting_refund: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch orders with service details
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      *,
      services (
        platform,
        service_type,
        price_per_1k
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            View and manage your service orders
          </p>
        </div>
        <Link href="/services">
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            Browse Services
          </Button>
        </Link>
      </div>

      {/* Orders List */}
      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ExternalLink className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No orders yet</h3>
                <p className="text-muted-foreground">
                  Start by browsing our services
                </p>
              </div>
              <Link href="/services">
                <Button>Browse Services</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {order.services?.platform?.toUpperCase()} -{" "}
                      {order.services?.service_type}
                    </CardTitle>
                    <CardDescription>
                      Order ID: {order.id.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[order.status as OrderStatus]}
                  >
                    {order.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium">
                      {order.quantity.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Price</p>
                    <p className="font-medium">
                      ₦{order.total_price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quality</p>
                    <p className="font-medium capitalize">
                      {order.quality_type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="font-medium capitalize">
                      {order.payment_method.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Link</p>
                  <a
                    href={order.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    {order.link}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Created: {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  {order.completed_at && (
                    <span>
                      Completed:{" "}
                      {new Date(order.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {order.admin_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Admin Notes
                    </p>
                    <p className="text-sm">{order.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
