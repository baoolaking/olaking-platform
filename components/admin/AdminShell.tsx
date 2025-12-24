"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface AdminShellProps {
  userRole: string;
  userName: string;
  children: React.ReactNode;
}

export function AdminShell({ userRole, userName, children }: AdminShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setIsMobileMenuOpen((prev) => !prev);
  const closeSidebar = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        userRole={userRole}
        userName={userName}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobile={setIsMobileMenuOpen}
        onCloseMobile={closeSidebar}
      />
      <main className="lg:pl-68 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AdminHeader userName={userName} onToggleSidebar={toggleSidebar} />
        {children}
      </main>
    </div>
  );
}
