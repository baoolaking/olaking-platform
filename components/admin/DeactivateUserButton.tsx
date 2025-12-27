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
import { UserX } from "lucide-react";
import { deactivateUser } from "@/app/admin/users/actions";
import { toast } from "sonner";

interface DeactivateUserButtonProps {
  id: string;
  userName: string;
  currentUserRole?: string;
  targetUserRole?: string;
}

export function DeactivateUserButton({
  id,
  userName,
  currentUserRole,
  targetUserRole,
}: DeactivateUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeactivate = () => {
    // Additional check: Sub admins cannot deactivate admin accounts
    if (currentUserRole === "sub_admin" &&
      (targetUserRole === "sub_admin" || targetUserRole === "super_admin")) {
      toast.error("You don't have permission to deactivate admin accounts.");
      return;
    }

    startTransition(async () => {
      try {
        await deactivateUser(id);
        toast.success("User account deactivated successfully!");
        setOpen(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again."
        );
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <UserX className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate User Account?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate <strong>{userName}</strong>?
            This will prevent them from logging in and using the platform. You
            can reactivate the account later by editing the user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeactivate}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deactivating..." : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
