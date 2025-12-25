"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const platform = formData.get("platform") as string;
  const serviceType = formData.get("service_type") as string;
  const pricePerK = parseFloat(formData.get("price_per_1k") as string);
  const minQuantity = parseInt(formData.get("min_quantity") as string);
  const maxQuantity = parseInt(formData.get("max_quantity") as string);
  const description = formData.get("description") as string;
  const deliveryTime = formData.get("delivery_time") as string;
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase.from("services").insert({
    platform,
    service_type: serviceType,
    price_per_1k: pricePerK,
    min_quantity: minQuantity,
    max_quantity: maxQuantity,
    description: description || null,
    delivery_time: deliveryTime || null,
    is_active: isActive,
  });

  if (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }

  revalidatePath("/admin/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const platform = formData.get("platform") as string;
  const serviceType = formData.get("service_type") as string;
  const pricePerK = parseFloat(formData.get("price_per_1k") as string);
  const minQuantity = parseInt(formData.get("min_quantity") as string);
  const maxQuantity = parseInt(formData.get("max_quantity") as string);
  const description = formData.get("description") as string;
  const deliveryTime = formData.get("delivery_time") as string;
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase
    .from("services")
    .update({
      platform,
      service_type: serviceType,
      price_per_1k: pricePerK,
      min_quantity: minQuantity,
      max_quantity: maxQuantity,
      description: description || null,
      delivery_time: deliveryTime || null,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update service: ${error.message}`);
  }

  revalidatePath("/admin/services");
}

export async function deleteService(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete service: ${error.message}`);
  }

  revalidatePath("/admin/services");
}
