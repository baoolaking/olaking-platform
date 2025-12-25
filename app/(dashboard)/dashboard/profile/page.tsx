"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, CheckCircle2, XCircle, User } from "lucide-react";
import { PasswordChangeForm } from "@/components/common/PasswordChangeForm";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  whatsapp_no: z
    .string()
    .regex(/^\+\d{10,15}$/, "Please enter a valid WhatsApp number"),
  bank_account_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_name: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

interface UserData {
  id: string;
  email: string;
  username: string;
  full_name: string;
  whatsapp_no: string;
  wallet_balance: number;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  role: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setUserData(data);
      reset({
        full_name: data.full_name,
        whatsapp_no: data.whatsapp_no,
        bank_account_name: data.bank_account_name || "",
        bank_account_number: data.bank_account_number || "",
        bank_name: data.bank_name || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileInput) => {
    if (!userData) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: data.full_name,
          whatsapp_no: data.whatsapp_no,
          bank_account_name: data.bank_account_name || null,
          bank_account_number: data.bank_account_number || null,
          bank_name: data.bank_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userData.id);

      if (error) throw error;

      toast.success("Profile updated successfully!", {
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      // Reload user data
      await loadUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description:
          error instanceof Error ? error.message : "Please try again",
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">{userData.full_name}</h3>
              <p className="text-sm text-muted-foreground">
                @{userData.username}
              </p>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="font-medium capitalize">
                  {userData.role.replace("_", " ")}
                </p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(userData.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details. Email and username cannot be
              changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Read-only fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={userData.username}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed
                  </p>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    {...register("full_name")}
                    disabled={isSaving}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_no">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_no"
                    type="tel"
                    placeholder="+234XXXXXXXXXX"
                    {...register("whatsapp_no")}
                    disabled={isSaving}
                  />
                  {errors.whatsapp_no && (
                    <p className="text-sm text-destructive">
                      {errors.whatsapp_no.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">
                  Bank Account Details (Optional)
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Account Name</Label>
                    <Input
                      id="bank_account_name"
                      type="text"
                      placeholder="John Doe"
                      {...register("bank_account_name")}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_number">
                        Account Number
                      </Label>
                      <Input
                        id="bank_account_number"
                        type="text"
                        placeholder="0123456789"
                        {...register("bank_account_number")}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        type="text"
                        placeholder="Access Bank"
                        {...register("bank_name")}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Section */}
      <PasswordChangeForm
        userEmail={userData.email}
        title="Change Password"
        description="Update your password to keep your account secure"
      />
    </div>
  );
}
