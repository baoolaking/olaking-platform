"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      // Check if identifier is username or whatsapp number
      const isWhatsApp = data.identifier.startsWith("+");

      let email = data.identifier;

      // If not email format, look up the email from username or whatsapp_no
      if (!data.identifier.includes("@")) {
        const { data: userData, error: lookupError } = await supabase
          .from("users")
          .select("email")
          .or(
            isWhatsApp
              ? `whatsapp_no.eq.${data.identifier}`
              : `username.eq.${data.identifier}`
          )
          .single();

        if (lookupError || !userData) {
          toast.error("Invalid credentials", {
            description: "Username/WhatsApp number or password is incorrect.",
            icon: <XCircle className="h-5 w-5" />,
          });
          setIsLoading(false);
          return;
        }

        email = userData.email;
      }

      // Sign in with email and password
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password: data.password,
        });

      if (authError) {
        toast.error("Login failed", {
          description:
            authError.message === "Invalid login credentials"
              ? "Username/WhatsApp number or password is incorrect."
              : authError.message,
          icon: <XCircle className="h-5 w-5" />,
        });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        throw new Error("Failed to authenticate");
      }

      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      // Redirect to intended page or dashboard
      router.push(redirectTo);
      router.refresh();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description:
          error.message || "An unexpected error occurred. Please try again.",
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your Olaking account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Username/WhatsApp/Email */}
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  Username, WhatsApp Number, or Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="john_doe or +234XXXXXXXXXX"
                  {...register("identifier")}
                  disabled={isLoading}
                />
                {errors.identifier && (
                  <p className="text-sm text-destructive">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
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
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
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
    </div>
  );
}
