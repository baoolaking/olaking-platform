"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, MessageCircle, Loader2 } from "lucide-react";

interface PaymentConfirmationSectionProps {
  orderId: string; // UUID for API calls
  orderNumber: string; // User-friendly number for display
  amount: number;
  onStatusUpdate?: () => void;
}

export function PaymentConfirmationSection({
  orderId,
  orderNumber,
  amount,
  onStatusUpdate
}: PaymentConfirmationSectionProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handlePaymentConfirmation = async () => {
    console.log("🔄 Starting payment confirmation for order:", orderId);
    setIsConfirming(true);

    try {
      console.log("📡 Making API call to /api/orders/confirm-payment");
      const response = await fetch("/api/orders/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ API Error:", error);
        throw new Error(error.error || "Failed to confirm payment");
      }

      const result = await response.json();
      console.log("✅ API Success:", result);

      toast.success("Payment confirmation sent to admin! You'll be notified once verified.");

      // Call the callback to refresh the order data
      onStatusUpdate?.();
    } catch (error) {
      console.error("💥 Error confirming payment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to confirm payment");
    } finally {
      setIsConfirming(false);
    }
  };

  const createWhatsAppLink = () => {
    const whatsappNumber1 = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_1;
    const whatsappNumber2 = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2;
    const defaultNumber = whatsappNumber1 || whatsappNumber2 || "+2349017992518";

    const message = encodeURIComponent(
      `Hi! I need help with my order payment. Order: ${orderNumber}, Amount: ₦${amount.toLocaleString()}. I've sent the payment and need assistance.`
    );
    return `https://wa.me/${defaultNumber.replace('+', '')}?text=${message}`;
  };

  return (
    <div className="space-y-3 pt-3 border-t">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={handlePaymentConfirmation}
          disabled={isConfirming}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm"
        >
          {isConfirming ? (
            <>
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              I've Sent the Money
            </>
          )}
        </Button>

        <Button
          asChild
          variant="outline"
          className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300 text-sm"
        >
          <a
            href={createWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Support
          </a>
        </Button>
      </div>

      <p className="text-sm text-orange-600 dark:text-orange-400">
        After making the payment, click the button above to notify our admin team.
      </p>
    </div>
  );
}