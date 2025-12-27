"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { transformPhoneNumber } from "@/lib/utils/phone";

export async function lookupUserByIdentifier(identifier: string) {
  const adminClient = createAdminClient();

  // If the identifier looks like a phone number, try to transform it
  const phoneResult = transformPhoneNumber(identifier);
  const searchIdentifiers = [identifier];
  
  // If phone transformation was successful, also search with the formatted version
  if (phoneResult.isValid && phoneResult.formatted !== identifier) {
    searchIdentifiers.push(phoneResult.formatted);
  }

  // Create OR condition for all possible identifiers
  const orConditions = searchIdentifiers.map(id => 
    `username.eq.${id},whatsapp_no.eq.${id},email.eq.${id}`
  ).join(',');

  const { data: userRecord, error: lookupError } = await adminClient
    .from("users")
    .select("id,email,role,is_active")
    .or(orConditions)
    .single();

  if (lookupError) {
    return { user: null, error: lookupError.message };
  }

  return { user: userRecord, error: null };
}
