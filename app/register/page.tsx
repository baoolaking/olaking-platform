"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Navigation } from "@/components/sections/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { SmartPhoneInput } from "@/components/ui/smart-phone-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Fetch user role to redirect to appropriate dashboard
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        const isAdmin =
          userData?.role === "super_admin" || userData?.role === "sub_admin";
        router.push(isAdmin ? "/admin" : "/dashboard");
      }
    };
    checkAuth();
  }, [router, supabase]);

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    try {
      // Check if username already exists (via RPC avoids RLS issues)
      const { data: usernameTaken, error: usernameErr } = await supabase.rpc(
        "is_username_taken",
        { p_username: data.username }
      );

      if (usernameErr) {
        console.error("Username check error:", usernameErr);
      }

      if (usernameTaken) {
        toast.error("Username already taken", {
          description: "Please choose a different username.",
        });
        setIsLoading(false);
        return;
      }

      // Check if WhatsApp number already exists (via RPC avoids RLS issues)
      const { data: whatsappTaken, error: waErr } = await supabase.rpc(
        "is_whatsapp_taken",
        { p_whatsapp: data.whatsapp_no }
      );

      if (waErr) {
        console.error("WhatsApp check error:", waErr);
      }

      if (whatsappTaken) {
        toast.error("WhatsApp number already registered", {
          description:
            "This WhatsApp number is already associated with an account.",
        });
        setIsLoading(false);
        return;
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            whatsapp_no: data.whatsapp_no,
            full_name: data.full_name,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Fetch user role from public.users table to determine redirect
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user role:", userError);
      }

      const userRole = userData?.role || "user";
      const dashboardUrl =
        userRole === "super_admin" || userRole === "sub_admin"
          ? "/admin"
          : "/dashboard";

      toast.success("Account created successfully!", {
        description: "Redirecting to your dashboard...",
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      // Redirect to appropriate dashboard after 1 second
      setTimeout(() => {
        router.push(dashboardUrl);
        router.refresh();
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      console.error("Registration error:", error);
      toast.error("Registration failed", {
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
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Create an account
              </CardTitle>
              <CardDescription className="text-center">
                Enter your details to get started with Olaking
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 mb-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="john_doe"
                    {...register("username")}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    {...register("full_name")}
                    disabled={isLoading}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* WhatsApp Number */}
                <Controller
                  name="whatsapp_no"
                  control={control}
                  render={({ field }) => (
                    <SmartPhoneInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.whatsapp_no?.message}
                      label="WhatsApp Number"
                      placeholder="09087654322, 7098765412, or +2347098765412"
                    />
                  )}
                />

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="••••••••"
                    disabled={isLoading}
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
