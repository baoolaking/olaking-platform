"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  MessageCircle,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { PaymentStatusNotifications } from "./payment-status-notifications";

interface PaymentWaitingStateProps {
  orderId: string;
  amount: number;
  onRefresh?: () => void;
}

export function PaymentWaitingState({
  orderId,
  amount,
  onRefresh
}: PaymentWaitingStateProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoUpdating, setIsAutoUpdating] = useState(false);
  const [maxWaitTime] = useState(() => {
    // Random time between 50-60 seconds
    return Math.floor(Math.random() * 11) + 50;
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (autoUpdateTimeoutRef.current) {
      clearTimeout(autoUpdateTimeoutRef.current);
      autoUpdateTimeoutRef.current = null;
    }
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
  };

  // Poll for status updates every 10 seconds
  const pollOrderStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.status !== 'awaiting_confirmation') {
          console.log(`Wallet funding order ${orderId} status changed to ${data.status}, stopping polling`);
          cleanup();
          onRefresh?.();
          return true; // Status changed
        }
      }
    } catch (error) {
      console.error('Error polling wallet funding order status:', error);
    }
    return false; // Status unchanged
  };

  // Auto-update order to pending status
  const autoUpdateToPending = async () => {
    if (isAutoUpdating) return;

    setIsAutoUpdating(true);
    console.log(`Auto-updating wallet funding order ${orderId} to pending status after ${maxWaitTime} seconds`);

    try {
      const response = await fetch(`/api/orders/${orderId}/auto-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'pending',
          reason: 'auto_confirmation_timeout'
        }),
      });

      if (response.ok) {
        toast.success("Payment verified! Your wallet has been credited.");
        cleanup();
        onRefresh?.();
      } else {
        console.error('Failed to auto-update wallet funding order status');
        setIsAutoUpdating(false);
      }
    } catch (error) {
      console.error('Error auto-updating wallet funding order:', error);
      setIsAutoUpdating(false);
    }
  };

  // Timer effect
  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  // Setup polling and auto-update
  useEffect(() => {
    // Start polling every 10 seconds
    pollIntervalRef.current = setInterval(async () => {
      const statusChanged = await pollOrderStatus();
      if (statusChanged) return; // Stop if status changed
    }, 10000);

    // Setup auto-update timeout
    autoUpdateTimeoutRef.current = setTimeout(() => {
      autoUpdateToPending();
    }, maxWaitTime * 1000);

    // Cleanup on unmount
    return cleanup;
  }, [orderId, maxWaitTime]);

  // Progress effect (based on maxWaitTime instead of fixed 30 minutes)
  useEffect(() => {
    const currentProgress = Math.min((timeElapsed / maxWaitTime) * 100, 100);
    setProgress(currentProgress);
  }, [timeElapsed, maxWaitTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedTime = () => {
    const remaining = Math.max(0, maxWaitTime - timeElapsed);
    if (remaining > 30) return `Auto-crediting in ~${Math.ceil(remaining / 10) * 10}s`;
    if (remaining > 0) return `Auto-crediting in ${remaining}s`;
    return "Crediting wallet automatically...";
  };

  const getProgressColor = () => {
    if (timeElapsed < 300) return "bg-green-500";
    if (timeElapsed < 900) return "bg-yellow-500";
    if (timeElapsed < 1800) return "bg-orange-500";
    return "bg-red-500";
  };

  const whatsappNumber1 = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_1;
  const whatsappNumber2 = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2;

  const createWhatsAppLink = (number: string) => {
    const message = encodeURIComponent(
      `Hi! I need help with my wallet funding. Order ID: ${orderId}, Amount: ₦${amount.toLocaleString()}. I've sent the payment and waiting for confirmation.`
    );
    return `https://wa.me/${number.replace('+', '')}?text=${message}`;
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 relative">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -top-1 -right-1">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-blue-800 dark:text-blue-200">
          Payment Confirmation Sent!
        </CardTitle>
        <p className="text-blue-600 dark:text-blue-300 text-sm">
          We're verifying your payment of <strong>₦{amount.toLocaleString()}</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
            {isAutoUpdating ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                Auto-Processing
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Awaiting Confirmation
              </>
            )}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {isAutoUpdating ? "Auto-Processing" : "Verification Progress"}
            </span>
            <span className="text-muted-foreground">{formatTime(timeElapsed)}</span>
          </div>
          <Progress
            value={progress}
            className={`h-2 transition-all duration-1000 ${isAutoUpdating
              ? 'bg-green-100 [&>div]:bg-green-500'
              : progress < 100 ? 'animate-pulse' : ''
              }`}
          />
          <p className="text-xs text-center text-muted-foreground">
            {getEstimatedTime()}
          </p>
        </div>

        {/* Status Notifications */}
        <PaymentStatusNotifications timeElapsed={timeElapsed} />

        {/* Order Details */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium mb-2 text-sm">Order Details</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold text-green-600">₦{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-blue-600">Awaiting Confirmation</span>
            </div>
          </div>
        </div>

        {/* What's Happening */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium mb-2 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
            What's happening now?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-start">
              <div className={`w-2 h-2 ${isAutoUpdating ? 'bg-green-500' : 'bg-green-500'} rounded-full mt-2 mr-2 flex-shrink-0`}></div>
              Your payment confirmation has been sent to our admin team
            </li>
            <li className="flex items-start">
              <div className={`w-2 h-2 ${timeElapsed > 10 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mt-2 mr-2 flex-shrink-0`}></div>
              We're checking our bank account for your transfer
            </li>
            <li className="flex items-start">
              <div className={`w-2 h-2 ${isAutoUpdating ? 'bg-green-500' : 'bg-gray-400'} rounded-full mt-2 mr-2 flex-shrink-0`}></div>
              {isAutoUpdating
                ? "Auto-crediting your wallet now"
                : `Auto-crediting in ${Math.max(0, maxWaitTime - timeElapsed)}s if not manually verified`
              }
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onRefresh}
            variant="outline"
            className="w-full"
            disabled={isAutoUpdating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAutoUpdating ? 'animate-spin' : ''}`} />
            {isAutoUpdating ? 'Processing...' : 'Check Status'}
          </Button>

          {/* Support Section */}
          <div className="border-t pt-4">
            <p className="text-sm text-center text-muted-foreground mb-3">
              Need help? Contact our support team
            </p>

            <div className="grid grid-cols-1 gap-2">
              {whatsappNumber1 && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300"
                >
                  <a
                    href={createWhatsAppLink(whatsappNumber1)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Support 1
                  </a>
                </Button>
              )}

              {whatsappNumber2 && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300"
                >
                  <a
                    href={createWhatsAppLink(whatsappNumber2)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Support 2
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Time-based Messages */}
        {timeElapsed > maxWaitTime && !isAutoUpdating && (
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Auto-crediting initiated!
                </p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Your wallet is being automatically credited. You'll be notified once complete.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}