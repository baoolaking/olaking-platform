"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBankAccount } from "@/app/admin/bank-accounts/actions";
import { toast } from "sonner";

interface DeleteBankAccountButtonProps {
  id: string;
  bankName: string;
  onSuccess?: () => void;
}

export function DeleteBankAccountButton({
  id,
  bankName,
  onSuccess,
}: DeleteBankAccountButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteBankAccount(id);
        toast.success("Bank account deleted successfully! Any associated orders have been updated.");
        setOpen(false);
        onSuccess?.();
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete bank account"
        );
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(newOpen) => !isPending && setOpen(newOpen)}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the bank account for{" "}
            <span className="font-semibold">{bankName}</span>?
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              Note: If there are orders associated with this bank account,
              they will be updated to remove the bank account reference before deletion.
            </span>
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
