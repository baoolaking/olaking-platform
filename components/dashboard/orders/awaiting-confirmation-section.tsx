"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  MessageCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface AwaitingConfirmationSectionProps {
  orderId: string; // UUID for API calls
  orderNumber: string; // User-friendly number for display
  amount: number;
  createdAt: string;
  onRefresh?: () => void;
}

export function AwaitingConfirmationSection({
  orderId,
  orderNumber,
  amount,
  createdAt,
  onRefresh
}: AwaitingConfirmationSectionProps) {
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
          console.log(`Order ${orderId} status changed to ${data.status}, stopping polling`);
          cleanup();
          onRefresh?.();
          return true; // Status changed
        }
      }
    } catch (error) {
      console.error('Error polling order status:', error);
    }
    return false; // Status unchanged
  };

  // Auto-update order to pending status
  const autoUpdateToPending = async () => {
    if (isAutoUpdating) return;

    setIsAutoUpdating(true);
    console.log(`Auto-updating order ${orderId} to pending status after ${maxWaitTime} seconds`);

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
        toast.success("Payment verified! Your order is now being processed.");
        cleanup();
        onRefresh?.();
      } else {
        console.error('Failed to auto-update order status');
        setIsAutoUpdating(false);
      }
    } catch (error) {
      console.error('Error auto-updating order:', error);
      setIsAutoUpdating(false);
    }
  };

  // Calculate time elapsed since order creation
  useEffect(() => {
    const startTime = new Date(createdAt).getTime();

    const updateTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setTimeElapsed(elapsed);
    };

    updateTime();
    timeIntervalRef.current = setInterval(updateTime, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [createdAt]);

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
    if (remaining > 30) return `Auto-processing in ~${Math.ceil(remaining / 10) * 10}s`;
    if (remaining > 0) return `Auto-processing in ${remaining}s`;
    return "Processing automatically...";
  };

  const createWhatsAppLink = () => {
    const whatsappNumber1 = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_1;
    const whatsappNumber2 = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2;
    const defaultNumber = whatsappNumber1 || whatsappNumber2 || "+2349017992518";

    const message = encodeURIComponent(
      `Hi! I need help with my order payment confirmation. Order: ${orderNumber}, Amount: ₦${amount.toLocaleString()}. I've sent the payment and it's awaiting confirmation.`
    );
    return `https://wa.me/${defaultNumber.replace('+', '')}?text=${message}`;
  };

  return (
    <div className="border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
      {/* Status Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
              Payment Confirmation Sent!
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-300 break-words">
              Verifying payment of ₦{amount.toLocaleString()}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700 text-xs self-start sm:self-center flex-shrink-0">
          {isAutoUpdating ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
              <span className="hidden xs:inline">Auto-</span>Processing
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              <span className="hidden xs:inline">Awaiting </span>Confirmation
            </>
          )}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {isAutoUpdating ? "Auto-Processing" : "Verification Progress"}
          </span>
          <span className="text-muted-foreground">{formatTime(timeElapsed)}</span>
        </div>
        <Progress
          value={progress}
          className={`h-1.5 sm:h-2 transition-all duration-1000 ${isAutoUpdating
            ? 'bg-green-100 [&>div]:bg-green-500'
            : progress < 100 ? 'animate-pulse' : ''
            }`}
        />
        <p className="text-xs text-center text-muted-foreground">
          {getEstimatedTime()}
        </p>
      </div>

      {/* What's Happening */}
      <div className="bg-blue-50 dark:bg-blue-950 p-2 sm:p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <h5 className="font-medium mb-2 text-xs flex items-center">
          <AlertCircle className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
          What's happening now?
        </h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li className="flex items-start">
            <div className={`w-1.5 h-1.5 ${isAutoUpdating ? 'bg-green-500' : 'bg-green-500'} rounded-full mt-1.5 mr-2 flex-shrink-0`}></div>
            <span>Your payment confirmation has been sent to our admin team</span>
          </li>
          <li className="flex items-start">
            <div className={`w-1.5 h-1.5 ${timeElapsed > 10 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mt-1.5 mr-2 flex-shrink-0`}></div>
            <span>We're checking our bank account for your transfer</span>
          </li>
          <li className="flex items-start">
            <div className={`w-1.5 h-1.5 ${isAutoUpdating ? 'bg-green-500' : 'bg-gray-400'} rounded-full mt-1.5 mr-2 flex-shrink-0`}></div>
            <span>
              {isAutoUpdating
                ? "Auto-processing your order now"
                : `Auto-processing in ${Math.max(0, maxWaitTime - timeElapsed)}s if not manually verified`
              }
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="flex-1 text-xs sm:text-sm"
          disabled={isAutoUpdating}
        >
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${isAutoUpdating ? 'animate-spin' : ''}`} />
          {isAutoUpdating ? 'Processing...' : 'Check Status'}
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300 text-xs sm:text-sm"
        >
          <a
            href={createWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            WhatsApp Support
          </a>
        </Button>
      </div>

      {/* Time-based Messages */}
      {timeElapsed > maxWaitTime && !isAutoUpdating && (
        <div className="bg-green-50 dark:bg-green-950 p-2 sm:p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-green-800 dark:text-green-200">
                Auto-processing initiated!
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                Your order is being automatically processed. You'll be notified once complete.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}