"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Progress effect (simulated progress over 30 minutes)
  useEffect(() => {
    const maxTime = 30 * 60; // 30 minutes in seconds
    const currentProgress = Math.min((timeElapsed / maxTime) * 100, 100);
    setProgress(currentProgress);
  }, [timeElapsed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedTime = () => {
    if (timeElapsed < 300) return "Usually within 5 minutes";
    if (timeElapsed < 900) return "Usually within 15 minutes";
    if (timeElapsed < 1800) return "Usually within 30 minutes";
    return "Taking longer than usual";
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
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Awaiting Confirmation
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verification Progress</span>
            <span className="text-muted-foreground">{formatTime(timeElapsed)}</span>
          </div>
          <Progress
            value={progress}
            className={`h-2 transition-all duration-1000 ${progress < 100 ? 'animate-pulse' : ''}`}
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
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              Your payment confirmation has been sent to our admin team
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              We're checking our bank account for your transfer
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              Once verified, your wallet will be credited automatically
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onRefresh}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Status
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
        {timeElapsed > 1800 && (
          <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Taking longer than usual?
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                  If it's been over 30 minutes, please contact our support team for immediate assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}