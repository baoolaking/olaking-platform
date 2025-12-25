"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function lookupUserByIdentifier(identifier: string) {
  const adminClient = createAdminClient();

  const { data: userRecord, error: lookupError } = await adminClient
    .from("users")
    .select("id,email,role,is_active")
    .or(
      `username.eq.${identifier},whatsapp_no.eq.${identifier},email.eq.${identifier}`
    )
    .single();

  if (lookupError) {
    return { user: null, error: lookupError.message };
  }

  return { user: userRecord, error: null };
}
