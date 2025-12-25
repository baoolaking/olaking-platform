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
      <div className="flex items-center justify-between py-4 gap-3">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="secondary"
              size="icon"
              className="inline-flex lg:hidden rounded-lg border-2 border-primary bg-primary/10 shadow-md hover:bg-primary/20 shrink-0"
              onClick={onToggleSidebar}
            >
              <Menu className="h-6 w-6 text-primary" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {walletBalance !== undefined && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">
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
