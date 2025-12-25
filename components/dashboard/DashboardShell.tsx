"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface DashboardShellProps {
  userRole?: string;
  fullName?: string;
  walletBalance?: number;
  children: React.ReactNode;
}

export function DashboardShell({
  userRole,
  fullName,
  walletBalance,
  children,
}: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setIsMobileMenuOpen((prev) => !prev);
  const closeSidebar = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        userRole={userRole}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobile={setIsMobileMenuOpen}
        onCloseMobile={closeSidebar}
      />
      <main className="lg:pl-68 max-w-360 mx-auto p-4 sm:p-6 lg:p-8">
        <DashboardHeader subtitle={fullName} walletBalance={walletBalance} onToggleSidebar={toggleSidebar} />
        {children}
      </main>
    </div>
  );
}
