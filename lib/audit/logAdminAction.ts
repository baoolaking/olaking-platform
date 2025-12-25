"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export async function logAdminAction({
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
}: AuditLogParams) {
  try {
    const supabase = await createClient();
    
    // Get current admin user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Failed to get user for audit log:", authError);
      return;
    }

    // Get IP address and user agent from headers
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || 
                     headersList.get("x-real-ip") || 
                     headersList.get("remote-addr") || 
                     "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Call the database function to log the action
    const { error } = await supabase.rpc("log_admin_action", {
      p_admin_id: user.id,
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId || null,
      p_old_values: oldValues ? JSON.stringify(oldValues) : null,
      p_new_values: newValues ? JSON.stringify(newValues) : null,
    });

    if (error) {
      console.error("Failed to log admin action:", error);
    }
  } catch (error) {
    console.error("Error in logAdminAction:", error);
  }
}

// Helper function to extract relevant fields for audit logging
export async function extractAuditFields(data: Record<string, any>, fields: string[]) {
  const result: Record<string, any> = {};
  fields.forEach(field => {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  });
  return result;
}