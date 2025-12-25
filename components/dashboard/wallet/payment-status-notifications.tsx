"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageCircle,
  Zap
} from "lucide-react";

interface PaymentStatusNotificationsProps {
  timeElapsed: number;
}

interface StatusMessage {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "urgent";
  icon: React.ReactNode;
  showAt: number; // seconds
  hideAt?: number; // seconds
}

export function PaymentStatusNotifications({ timeElapsed }: PaymentStatusNotificationsProps) {
  const [currentMessages, setCurrentMessages] = useState<StatusMessage[]>([]);

  const statusMessages: StatusMessage[] = [
    {
      id: "initial",
      message: "Your payment confirmation has been sent to our team",
      type: "success",
      icon: <CheckCircle2 className="h-4 w-4" />,
      showAt: 0,
      hideAt: 60
    },
    {
      id: "processing",
      message: "We're checking our bank account for your transfer",
      type: "info",
      icon: <Clock className="h-4 w-4" />,
      showAt: 30,
      hideAt: 300
    },
    {
      id: "normal_wait",
      message: "Verification usually takes 5-15 minutes during business hours",
      type: "info",
      icon: <Zap className="h-4 w-4" />,
      showAt: 120,
      hideAt: 600
    },
    {
      id: "longer_wait",
      message: "Taking a bit longer than usual - this is normal during peak hours",
      type: "warning",
      icon: <AlertTriangle className="h-4 w-4" />,
      showAt: 600,
      hideAt: 1200
    },
    {
      id: "extended_wait",
      message: "If you need immediate assistance, please contact our support team",
      type: "urgent",
      icon: <MessageCircle className="h-4 w-4" />,
      showAt: 1200
    }
  ];

  useEffect(() => {
    const visibleMessages = statusMessages.filter(msg => {
      const shouldShow = timeElapsed >= msg.showAt;
      const shouldHide = msg.hideAt ? timeElapsed >= msg.hideAt : false;
      return shouldShow && !shouldHide;
    });

    setCurrentMessages(visibleMessages);
  }, [timeElapsed]);

  if (currentMessages.length === 0) return null;

  const getMessageStyle = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200";
      case "urgent":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200";
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default";
      case "warning":
        return "secondary";
      case "urgent":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-2">
      {currentMessages.map((message, index) => (
        <Card
          key={message.id}
          className={`${getMessageStyle(message.type)} animate-in slide-in-from-top-2 duration-500`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {message.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {message.message}
                </p>
              </div>
              <Badge
                variant={getBadgeVariant(message.type)}
                className="text-xs"
              >
                {message.type === "urgent" ? "Action Needed" :
                  message.type === "warning" ? "Notice" :
                    message.type === "success" ? "Confirmed" : "Info"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}