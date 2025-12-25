"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ConfirmSignOutButton } from "@/components/common/ConfirmSignOutButton";
import { Button } from "@/components/ui/button";
import { Menu, Wallet } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  walletBalance?: number;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({
  title = "Dashboard",
  subtitle,
  walletBalance,
  onToggleSidebar,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 mb-6 border-b">
      <div className="flex items-center justify-between py-3 sm:py-4 gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onToggleSidebar && (
            <Button
              variant="secondary"
              size="icon"
              className="inline-flex lg:hidden rounded-lg border-2 border-primary bg-primary/10 shadow-md hover:bg-primary/20 shrink-0"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {walletBalance !== undefined && (
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold">
                ₦{walletBalance.toLocaleString()}
              </span>
            </div>
          )}
          <ThemeToggle />
          <ConfirmSignOutButton hideLabelOnMobile />
        </div>
      </div>
    </header>
  );
}
