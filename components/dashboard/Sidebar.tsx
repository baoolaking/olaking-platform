"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingBag, User, Wallet } from "lucide-react";
import { useState } from "react";
import { ConfirmSignOutButton } from "@/components/common/ConfirmSignOutButton";

interface SidebarProps {
  userRole?: string;
  isMobileMenuOpen?: boolean;
  onToggleMobile?: (open: boolean) => void;
  onCloseMobile?: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    name: "Wallet",
    href: "/dashboard/wallet",
    icon: Wallet,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export function Sidebar({
  userRole,
  isMobileMenuOpen,
  onToggleMobile,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const open = isMobileMenuOpen ?? internalMobileOpen;
  const setOpen = onToggleMobile ?? setInternalMobileOpen;
  const closeMobileMenu = onCloseMobile ?? (() => setInternalMobileOpen(false));

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
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  O
                </span>
              </div>
              <span className="font-bold text-lg">Olaking</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
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
            {userRole && (
              <div className="px-4 py-2 mb-2 bg-accent/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium capitalize">
                  {userRole.replace("_", " ")}
                </p>
              </div>
            )}
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
