"use client";

import { useState } from "react";
import { useTransition } from "react";
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
import { Plus } from "lucide-react";
import {
  createBankAccount,
  updateBankAccount,
} from "@/app/admin/bank-accounts/actions";

interface BankAccountFormProps {
  account?: {
    id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    is_active: boolean;
  };
  onSuccess?: () => void;
}

export function BankAccountForm({ account, onSuccess }: BankAccountFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!account;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateBankAccount(account.id, formData);
        } else {
          await createBankAccount(formData);
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
            Add Bank Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Bank Account" : "Add New Bank Account"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the bank account details"
              : "Add a new bank account for the platform"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              name="bank_name"
              placeholder="e.g., First National Bank"
              required
              defaultValue={account?.bank_name || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name</Label>
            <Input
              id="account_name"
              name="account_name"
              placeholder="e.g., Olaking Business"
              required
              defaultValue={account?.account_name || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              name="account_number"
              placeholder="e.g., 1234567890"
              required
              defaultValue={account?.account_number || ""}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              name="is_active"
              defaultChecked={account?.is_active || false}
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Active
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
