"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ConfirmSignOutButton } from "@/components/common/ConfirmSignOutButton";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  userName?: string;
  onToggleSidebar?: () => void;
}

export function AdminHeader({ userName, onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 mb-6 border-b">
      <div className="flex items-center justify-between py-3 gap-3">
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
            <h1 className="text-xl font-semibold leading-tight">
              Admin Dashboard
            </h1>
            {userName && (
              <p className="text-sm text-muted-foreground">
                Welcome back, {userName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConfirmSignOutButton hideLabelOnMobile />
        </div>
      </div>
    </header>
  );
}
