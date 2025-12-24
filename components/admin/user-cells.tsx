"use client";

import { Badge } from "@/components/ui/badge";

export function UserCell({
  fullName,
  username,
}: {
  fullName: string;
  username: string;
}) {
  return (
    <div>
      <p className="font-medium">{fullName}</p>
      <p className="text-sm text-muted-foreground">@{username}</p>
    </div>
  );
}

export function RoleCell({
  role,
  roleColor,
}: {
  role: string;
  roleColor: string;
}) {
  return (
    <Badge variant="outline" className={roleColor}>
      {role}
    </Badge>
  );
}

export function StatusCell({ status }: { status: string }) {
  return (
    <Badge variant={status === "Active" ? "default" : "secondary"}>
      {status}
    </Badge>
  );
}
