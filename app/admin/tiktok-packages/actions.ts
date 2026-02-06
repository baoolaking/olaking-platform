"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TikTokCoinPackageInput, TikTokCoinPackageUpdate } from "@/types/tiktok-packages";

/**
 * Get all TikTok coin packages (admin view - includes inactive)
 */
export async function getTikTokPackages() {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "sub_admin"].includes(userData.role)) {
    throw new Error("Unauthorized: Admin access required");
  }

  const { data: packages, error } = await supabase
    .from("tiktok_coin_packages")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error);
    throw new Error("Failed to fetch packages");
  }

  return packages || [];
}

/**
 * Create a new TikTok coin package
 */
export async function createTikTokPackage(input: TikTokCoinPackageInput) {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "sub_admin"].includes(userData.role)) {
    throw new Error("Unauthorized: Admin access required");
  }

  // Auto-generate display_price if not provided
  const displayPrice = input.display_price || `₦${input.price.toLocaleString()}`;

  const { data, error } = await supabase
    .from("tiktok_coin_packages")
    .insert({
      coins: input.coins,
      price: input.price,
      display_price: displayPrice,
      is_popular: input.is_popular || false,
      is_active: input.is_active !== undefined ? input.is_active : true,
      sort_order: input.sort_order || 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating package:", error);
    throw new Error(error.message || "Failed to create package");
  }

  revalidatePath("/admin/tiktok-packages");
  revalidatePath("/api/tiktok-packages");
  
  return data;
}

/**
 * Update a TikTok coin package
 */
export async function updateTikTokPackage(id: string, updates: TikTokCoinPackageUpdate) {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "sub_admin"].includes(userData.role)) {
    throw new Error("Unauthorized: Admin access required");
  }

  // Auto-generate display_price if price is updated but display_price is not
  const updateData: any = { ...updates };
  if (updates.price && !updates.display_price) {
    updateData.display_price = `₦${updates.price.toLocaleString()}`;
  }

  const { data, error } = await supabase
    .from("tiktok_coin_packages")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating package:", error);
    throw new Error(error.message || "Failed to update package");
  }

  revalidatePath("/admin/tiktok-packages");
  revalidatePath("/api/tiktok-packages");
  
  return data;
}

/**
 * Delete a TikTok coin package (super admin only)
 */
export async function deleteTikTokPackage(id: string) {
  const supabase = await createClient();

  // Check if user is super admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "super_admin") {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { error } = await supabase
    .from("tiktok_coin_packages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting package:", error);
    throw new Error(error.message || "Failed to delete package");
  }

  revalidatePath("/admin/tiktok-packages");
  revalidatePath("/api/tiktok-packages");
}

/**
 * Toggle package active status
 */
export async function togglePackageStatus(id: string, isActive: boolean) {
  return updateTikTokPackage(id, { is_active: isActive });
}

/**
 * Toggle package popular status
 */
export async function togglePackagePopular(id: string, isPopular: boolean) {
  return updateTikTokPackage(id, { is_popular: isPopular });
}
