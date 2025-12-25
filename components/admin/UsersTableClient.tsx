"use client";

import { ResponsiveTable } from "@/components/ui/responsive-table";
import { RoleCell, StatusCell } from "@/components/admin/user-cells";
import { UserForm } from "@/components/admin/UserForm";
import { DeactivateUserButton } from "@/components/admin/DeactivateUserButton";
import { Tables } from "@/types/database";

type User = Tables<"users">;

type ExtendedUser = User & {
  displayRole: string;
  displayWallet: string;
  displayOrders: number;
  displayStatus: string;
  displayJoined: string;
  roleColor: string;
};

interface UsersTableClientProps {
  users: ExtendedUser[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function UsersTableClient({
  users,
  currentUserId,
  currentUserRole,
}: UsersTableClientProps) {
  return (
    <ResponsiveTable
      columns={[
        { key: "full_name", label: "User", isPrimary: true },
        { key: "email", label: "Email" },
        { key: "whatsapp_no", label: "WhatsApp" },
        {
          key: "displayRole",
          label: "Role",
          render: (_: unknown, row: ExtendedUser) => (
            <RoleCell role={row.displayRole} roleColor={row.roleColor} />
          ),
        },
        { key: "displayWallet", label: "Wallet" },
        { key: "displayOrders", label: "Orders" },
        {
          key: "displayStatus",
          label: "Status",
          render: (status: unknown) => <StatusCell status={String(status)} />,
        },
        { key: "displayJoined", label: "Joined" },
        {
          key: "actions",
          label: "Actions",
          render: (_: unknown, row: ExtendedUser) => {
            if (currentUserId && row.id === currentUserId) {
              return <span className="text-muted-foreground">—</span>;
            }

            // Check if current user can manage this user
            const canEdit = currentUserRole === "super_admin" ||
              (currentUserRole === "sub_admin" && row.role === "user");

            // Sub admins cannot deactivate admin accounts
            const canDeactivate = currentUserRole === "super_admin" ||
              (currentUserRole === "sub_admin" && row.role === "user");

            return (
              <div className="flex gap-2">
                {canEdit && (
                  <UserForm user={row} currentUserRole={currentUserRole} />
                )}
                {row.is_active && canDeactivate && (
                  <DeactivateUserButton
                    id={row.id}
                    userName={row.full_name}
                    currentUserRole={currentUserRole}
                    targetUserRole={row.role}
                  />
                )}
                {!canEdit && !canDeactivate && (
                  <span className="text-muted-foreground text-sm">No actions</span>
                )}
              </div>
            );
          },
        },
      ]}
      data={users}
      keyField="id"
      getMobileTitle={(row: ExtendedUser) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.full_name}</span>
          <span className="text-muted-foreground">-</span>
          <RoleCell role={row.displayRole} roleColor={row.roleColor} />
        </div>
      )}
    />
  );
}
