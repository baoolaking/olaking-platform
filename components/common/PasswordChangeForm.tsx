"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Lock } from "lucide-react";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth";
import { PasswordInput } from "@/components/ui/password-input";

interface PasswordChangeFormProps {
  userEmail: string;
  title?: string;
  description?: string;
  className?: string;
}

export function PasswordChangeForm({
  userEmail,
  title = "Change Password",
  description = "Update your password to keep your account secure",
  className = "",
}: PasswordChangeFormProps) {
  const supabase = createClient();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsChangingPassword(true);
    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect", {
          icon: <XCircle className="h-5 w-5" />,
        });
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Password changed successfully!", {
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      // Reset the form
      reset();
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password", {
        description:
          error instanceof Error ? error.message : "Please try again",
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <PasswordInput
                id="currentPassword"
                placeholder="Enter your current password"
                showPassword={showCurrentPassword}
                onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
                {...register("currentPassword")}
                disabled={isChangingPassword}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInput
                id="newPassword"
                placeholder="Enter your new password"
                showPassword={showNewPassword}
                onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                {...register("newPassword")}
                disabled={isChangingPassword}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <PasswordInput
                id="confirmNewPassword"
                placeholder="Confirm your new password"
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                {...register("confirmNewPassword")}
                disabled={isChangingPassword}
              />
              {errors.confirmNewPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-start">
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}