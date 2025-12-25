"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  CreditCard,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ConfirmSignOutButton } from "@/components/common/ConfirmSignOutButton";

interface AdminSidebarProps {
  userRole: string;
  userName: string;
  isMobileMenuOpen?: boolean;
  onToggleMobile?: (open: boolean) => void;
  onCloseMobile?: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["super_admin", "sub_admin"], // Both roles can access
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["super_admin", "sub_admin"], // Both roles can access
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    roles: ["super_admin", "sub_admin"], // Both roles can access
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: Shield,
    roles: ["super_admin"], // Only super admin
  },
  {
    name: "Bank Accounts",
    href: "/admin/bank-accounts",
    icon: CreditCard,
    roles: ["super_admin"], // Only super admin
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["super_admin"], // Only super admin
  },
];

export function AdminSidebar({
  userRole,
  userName,
  isMobileMenuOpen,
  onToggleMobile,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isSuperAdmin = userRole === "super_admin";

  const open = isMobileMenuOpen ?? internalMobileOpen;
  const setOpen = onToggleMobile ?? setInternalMobileOpen;
  const closeMobileMenu = onCloseMobile ?? (() => setInternalMobileOpen(false));

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col space-y-3">
              <Link href="/admin">
                <Image
                  src="/images/header-logo.png"
                  alt="BAO OLAKING Logo"
                  width={100}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
              <Badge variant="outline" className="w-fit text-xs">
                {isSuperAdmin ? "Super Admin" : "Sub Admin"}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & Sign out */}
          <div className="p-4 border-t border-border">
            <div className="px-4 py-2 mb-2 bg-accent/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium truncate">{userName}</p>
            </div>
            <ConfirmSignOutButton className="w-full justify-start text-muted-foreground hover:text-foreground" />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
}
