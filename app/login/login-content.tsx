"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { lookupUserByIdentifier } from "./actions";
import ForgotPasswordForm from "./forgot-password-form";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) return;

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const redirectTo = searchParams?.get("redirectTo");
      const isAdmin = ["super_admin", "sub_admin"].includes(
        userData?.role ?? ""
      );
      const destination = redirectTo || (isAdmin ? "/admin" : "/dashboard");

      router.replace(destination);
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, supabase]);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const identifier = data.identifier.trim();

      // Use server action to lookup user (bypasses RLS)
      const { user: userRecord, error: lookupErrorMsg } =
        await lookupUserByIdentifier(identifier);

      if (lookupErrorMsg || !userRecord) {
        toast.error("Account not found", {
          description: "Check your username or WhatsApp number and try again.",
          icon: <XCircle className="h-5 w-5" />,
        });
        return;
      }

      if (userRecord.is_active === false) {
        toast.error("Account inactive", {
          description: "Please contact support to reactivate your account.",
          icon: <XCircle className="h-5 w-5" />,
        });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password: data.password,
      });

      if (signInError) {
        toast.error("Sign in failed", {
          description: signInError.message,
          icon: <XCircle className="h-5 w-5" />,
        });
        return;
      }

      const redirectTo = searchParams?.get("redirectTo");
      const isAdmin = ["super_admin", "sub_admin"].includes(userRecord.role);
      const destination = redirectTo || (isAdmin ? "/admin" : "/dashboard");

      toast.success("Signed in successfully", {
        description: "Redirecting to your dashboard...",
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 600);
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
          <AnimatePresence mode="wait">
            {showForgotPassword ? (
              <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                      Welcome back
                    </CardTitle>
                    <CardDescription className="text-center">
                      Sign in with your username or WhatsApp number
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="identifier">Username or WhatsApp</Label>
                        <Input
                          id="identifier"
                          type="text"
                          placeholder="e.g. olaking or +234XXXXXXXXXX"
                          disabled={isLoading}
                          {...register("identifier")}
                          className={errors.identifier ? "border-destructive" : ""}
                        />
                        {errors.identifier && (
                          <p className="text-sm text-destructive">
                            {errors.identifier.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                          id="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          showPassword={showPassword}
                          onTogglePassword={() => setShowPassword((prev) => !prev)}
                          {...register("password")}
                          className={errors.password ? "border-destructive" : ""}
                        />
                        {errors.password && (
                          <p className="text-sm text-destructive">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 text-sm"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                          href="/register"
                          className="text-primary hover:underline font-medium"
                        >
                          Create one
                        </Link>
                      </p>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}