"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Navigation } from "@/components/sections/Navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("🔍 Checking authentication status on reset password page");

        const { data: { user }, error } = await supabase.auth.getUser();

        console.log("🔍 Auth check result:", {
          user: user ? { id: user.id, email: user.email } : null,
          error: error?.message || null
        });

        if (error || !user) {
          console.log("❌ No authenticated user, redirecting to login");
          toast.error("Invalid reset session", {
            description: "Please request a new password reset link.",
            icon: <XCircle className="h-5 w-5" />,
          });
          router.push("/login");
          return;
        }

        console.log("✅ User authenticated, showing reset form");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Auth check error:", error);
        router.push("/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router, supabase.auth]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!isAuthenticated) {
      toast.error("Not authenticated", {
        description: "Please request a new password reset link.",
        icon: <XCircle className="h-5 w-5" />,
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error("Password reset failed", {
          description: error.message,
          icon: <XCircle className="h-5 w-5" />,
        });
        return;
      }

      toast.success("Password updated successfully", {
        description: "You can now sign in with your new password.",
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      // Sign out and redirect to login
      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";

      toast.error("Something went wrong", {
        description: errorMessage,
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
        <Navigation />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Verifying reset session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
      <Navigation />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter your new password"
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your new password"
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
                <div className="text-center text-sm">
                  <Link
                    href="/login"
                    className="text-primary hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}