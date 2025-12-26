"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Order } from "@/hooks/use-admin-orders";

interface SendNotificationButtonProps {
  order: Order;
}

export function SendNotificationButton({ order }: SendNotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [adminNotes, setAdminNotes] = useState("");

  const handleSendNotification = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/admin/send-order-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          status: selectedStatus,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send notification");
      }

      toast.success("Email notification sent successfully!");
      setIsOpen(false);
      setAdminNotes("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Order Notification</DialogTitle>
          <DialogDescription>
            Send an email notification to the customer for order {order.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Email Template</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as typeof order.status)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status for email template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Order Confirmed (Pending)</SelectItem>
                <SelectItem value="completed">Order Completed</SelectItem>
                <SelectItem value="failed">Order Issue (Failed)</SelectItem>
                <SelectItem value="awaiting_refund">Refund Processing</SelectItem>
                <SelectItem value="refunded">Refund Completed</SelectItem>
                <SelectItem value="awaiting_payment">Payment Required</SelectItem>
                <SelectItem value="awaiting_confirmation">Awaiting Confirmation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes for the customer..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p><strong>Customer:</strong> {order.users?.full_name || 'Unknown'}</p>
            <p><strong>Service:</strong> {order.services?.platform || 'Unknown'} {order.services?.service_type || 'Service'}</p>
            <p><strong>Current Status:</strong> {order.status}</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendNotification}
              disabled={isSending || !selectedStatus}
              className="flex-1"
            >
              {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Email
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}