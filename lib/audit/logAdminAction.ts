"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  errorDetails?: {
    error: string;
    errorCode?: string;
    stackTrace?: string;
    context?: Record<string, any>;
  };
  refundDetails?: {
    refundAmount: number;
    transactionId?: string;
    newBalance?: number;
    refundMethod: 'wallet' | 'bank_transfer';
    adminNotes?: string;
  };
}

export async function logAdminAction({
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  errorDetails,
  refundDetails,
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

    // Enhance new values with refund details if provided
    let enhancedNewValues = newValues;
    if (refundDetails) {
      enhancedNewValues = {
        ...newValues,
        refund_amount: refundDetails.refundAmount,
        refund_transaction_id: refundDetails.transactionId,
        refund_new_balance: refundDetails.newBalance,
        refund_method: refundDetails.refundMethod,
        admin_notes: refundDetails.adminNotes,
        refund_processed_at: new Date().toISOString(),
      };
    }

    // Add error details to new values if provided
    if (errorDetails) {
      enhancedNewValues = {
        ...enhancedNewValues,
        error_message: errorDetails.error,
        error_code: errorDetails.errorCode,
        error_context: errorDetails.context,
        error_occurred_at: new Date().toISOString(),
      };
    }

    // Call the database function to log the action
    const { error } = await supabase.rpc("log_admin_action", {
      p_admin_id: user.id,
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId || null,
      p_old_values: oldValues ? JSON.stringify(oldValues) : null,
      p_new_values: enhancedNewValues ? JSON.stringify(enhancedNewValues) : null,
    });

    if (error) {
      console.error("Failed to log admin action:", error);
      // Log to console as fallback when database logging fails
      console.error("AUDIT LOG FALLBACK:", {
        timestamp: new Date().toISOString(),
        admin_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: enhancedNewValues,
        error_details: errorDetails,
        refund_details: refundDetails,
      });
    }
  } catch (error) {
    console.error("Error in logAdminAction:", error);
    // Log to console as fallback when audit logging completely fails
    console.error("AUDIT LOG CRITICAL FALLBACK:", {
      timestamp: new Date().toISOString(),
      action,
      entity_type: entityType,
      entity_id: entityId,
      audit_error: error instanceof Error ? error.message : 'Unknown error',
    });
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

// Specialized function for logging refund operations
export async function logRefundOperation({
  orderId,
  refundAmount,
  transactionId,
  newBalance,
  adminNotes,
  oldOrderStatus,
  newOrderStatus,
}: {
  orderId: string;
  refundAmount: number;
  transactionId?: string;
  newBalance?: number;
  adminNotes?: string;
  oldOrderStatus: string;
  newOrderStatus: string;
}) {
  await logAdminAction({
    action: "ORDER_FAILED_WITH_REFUND",
    entityType: "order",
    entityId: orderId,
    oldValues: {
      status: oldOrderStatus,
    },
    newValues: {
      status: newOrderStatus,
      admin_notes: adminNotes,
    },
    refundDetails: {
      refundAmount,
      transactionId,
      newBalance,
      refundMethod: 'wallet', // All refunds go to wallet
      adminNotes,
    },
  });
}

// Specialized function for logging refund errors
export async function logRefundError({
  orderId,
  refundAmount,
  error,
  errorCode,
  context,
  adminNotes,
  oldOrderStatus,
  revertedOrderStatus,
}: {
  orderId: string;
  refundAmount: number;
  error: string;
  errorCode?: string;
  context?: Record<string, any>;
  adminNotes?: string;
  oldOrderStatus: string;
  revertedOrderStatus: string;
}) {
  await logAdminAction({
    action: "ORDER_REFUND_FAILED",
    entityType: "order",
    entityId: orderId,
    oldValues: {
      status: oldOrderStatus,
    },
    newValues: {
      status: revertedOrderStatus,
      admin_notes: `Refund failed: ${error}${adminNotes ? ` | Original notes: ${adminNotes}` : ''}`,
    },
    errorDetails: {
      error,
      errorCode,
      context: {
        ...context,
        attempted_refund_amount: refundAmount,
        original_admin_notes: adminNotes,
      },
    },
  });
}

// Function to log wallet operation errors specifically
export async function logWalletOperationError({
  operation,
  userId,
  orderId,
  amount,
  error,
  context,
}: {
  operation: 'credit' | 'debit' | 'refund';
  userId: string;
  orderId?: string;
  amount: number;
  error: string;
  context?: Record<string, any>;
}) {
  await logAdminAction({
    action: `WALLET_${operation.toUpperCase()}_FAILED`,
    entityType: "wallet_transaction",
    entityId: orderId,
    errorDetails: {
      error,
      context: {
        ...context,
        user_id: userId,
        amount,
        operation,
      },
    },
  });
}