"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersFiltersProps {
  q: string;
  role: string; // "all" | "user" | "sub_admin" | "super_admin"
  status: string; // "all" | "active" | "inactive"
}

export function UsersFilters({ q, role, status }: UsersFiltersProps) {
  const router = useRouter();
  const [qValue, setQValue] = useState(q || "");
  const [roleValue, setRoleValue] = useState(role || "all");
  const [statusValue, setStatusValue] = useState(status || "all");

  const onApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    // Always reset to first page when applying filters
    params.set("page", "1");
    if (qValue) params.set("q", qValue);
    if (roleValue) params.set("role", roleValue);
    if (statusValue) params.set("status", statusValue);
    const href = params.toString()
      ? `/admin/users?${params.toString()}`
      : "/admin/users";
    router.push(href);
    router.refresh();
  };

  const onReset = () => {
    setQValue("");
    setRoleValue("all");
    setStatusValue("all");
    router.push("/admin/users");
  };

  return (
    <form onSubmit={onApply} className="flex flex-wrap gap-3">
      <Input
        type="text"
        value={qValue}
        onChange={(e) => setQValue(e.target.value)}
        placeholder="Search name, username, email, WhatsApp"
        className="w-full md:w-64"
      />

      <div className="grid grid-cols-2 gap-3">
        {/* Role filter */}
        <Select value={roleValue} onValueChange={setRoleValue}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="sub_admin">Sub Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select value={statusValue} onValueChange={setStatusValue}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" variant="default">
        Apply
      </Button>
      {(q || role !== "all" || status !== "all") && (
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      )}
    </form>
  );
}
