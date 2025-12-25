"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAdminAction, extractAuditFields } from "@/lib/audit/logAdminAction";

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

  const newService = {
    platform,
    service_type: serviceType,
    price_per_1k: pricePerK,
    min_quantity: minQuantity,
    max_quantity: maxQuantity,
    description: description || null,
    delivery_time: deliveryTime || null,
    is_active: isActive,
  };

  const { data, error } = await supabase
    .from("services")
    .insert(newService)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }

  // Log the admin action
  await logAdminAction({
    action: "CREATE_SERVICE",
    entityType: "service",
    entityId: data.id,
    newValues: await extractAuditFields(newService, [
      "platform",
      "service_type",
      "price_per_1k",
      "min_quantity",
      "max_quantity",
      "description",
      "delivery_time",
      "is_active"
    ]),
  });

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

  // Get old values for audit log
  const { data: oldData } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  const platform = formData.get("platform") as string;
  const serviceType = formData.get("service_type") as string;
  const pricePerK = parseFloat(formData.get("price_per_1k") as string);
  const minQuantity = parseInt(formData.get("min_quantity") as string);
  const maxQuantity = parseInt(formData.get("max_quantity") as string);
  const description = formData.get("description") as string;
  const deliveryTime = formData.get("delivery_time") as string;
  const isActive = formData.get("is_active") === "on";

  const newValues = {
    platform,
    service_type: serviceType,
    price_per_1k: pricePerK,
    min_quantity: minQuantity,
    max_quantity: maxQuantity,
    description: description || null,
    delivery_time: deliveryTime || null,
    is_active: isActive,
  };

  const { error } = await supabase
    .from("services")
    .update(newValues)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update service: ${error.message}`);
  }

  // Log the admin action
  const auditFields = [
    "platform",
    "service_type", 
    "price_per_1k",
    "min_quantity",
    "max_quantity",
    "description",
    "delivery_time",
    "is_active"
  ];

  await logAdminAction({
    action: "UPDATE_SERVICE",
    entityType: "service",
    entityId: id,
    oldValues: oldData ? await extractAuditFields(oldData, auditFields) : undefined,
    newValues: await extractAuditFields(newValues, auditFields),
  });

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

  // Get old values for audit log before deletion
  const { data: oldData } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete service: ${error.message}`);
  }

  // Log the admin action
  await logAdminAction({
    action: "DELETE_SERVICE",
    entityType: "service",
    entityId: id,
    oldValues: oldData ? await extractAuditFields(oldData, [
      "platform",
      "service_type",
      "price_per_1k",
      "min_quantity", 
      "max_quantity",
      "description",
      "delivery_time",
      "is_active"
    ]) : undefined,
  });

  revalidatePath("/admin/services");
}
