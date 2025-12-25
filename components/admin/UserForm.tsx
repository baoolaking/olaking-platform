"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { createUser, updateUser } from "@/app/admin/users/actions";
import { Tables } from "@/types/database";

type User = Tables<"users">;

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<string>(
    user?.role || "user"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const isEdit = !!user;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("role", selectedRole);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateUser(user.id, formData);
        } else {
          await createUser(formData);
        }
        setOpen(false);
        onSuccess?.();
      } catch (error) {
        console.error("Error:", error);
        alert(
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again."
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update user details. Password cannot be changed here."
              : "Create a new user account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="John Doe"
              required
              defaultValue={user?.full_name || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
              defaultValue={user?.email || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="johndoe"
              required
              defaultValue={user?.username || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_no">WhatsApp Number</Label>
            <Input
              id="whatsapp_no"
              name="whatsapp_no"
              placeholder="+234..."
              required
              defaultValue={user?.whatsapp_no || ""}
            />
          </div>
          {!isEdit && (
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="sub_admin">Sub Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wallet Balance - Edit Mode */}
          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="wallet_balance">Wallet Balance (₦)</Label>
              <Input
                id="wallet_balance"
                name="wallet_balance"
                type="number"
                placeholder="0"
                defaultValue={user?.wallet_balance || "0"}
              />
            </div>
          )}

          {/* Bank Details - Optional */}
          <div className="pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="w-full justify-between px-0 hover:bg-transparent"
            >
              <span className="text-sm font-medium">
                Bank Details (Optional)
              </span>
              {showOptionalFields ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {showOptionalFields && (
              <div className="space-y-3 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="bank_account_name">Account Name</Label>
                  <Input
                    id="bank_account_name"
                    name="bank_account_name"
                    placeholder="John Doe"
                    defaultValue={user?.bank_account_name || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    name="bank_account_number"
                    placeholder="0123456789"
                    defaultValue={user?.bank_account_number || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    name="bank_name"
                    placeholder="First Bank"
                    defaultValue={user?.bank_name || ""}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              name="is_active"
              defaultChecked={user?.is_active ?? true}
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Active Account
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
