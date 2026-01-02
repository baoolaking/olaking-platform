import { createAdminClient } from "@/lib/supabase/admin";
import { Database } from "@/types/database";
import { logWalletOperationError } from "@/lib/audit/logAdminAction";

// Constants for refund processing
const LARGE_REFUND_THRESHOLD = 100000; // ₦100,000
const EXTREME_REFUND_THRESHOLD = 1000000; // ₦1,000,000

// Type definitions for refund operations
export interface RefundResult {
  success: boolean;
  transactionId?: string;
  newBalance?: number;
  error?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: Database["public"]["Enums"]["order_status"];
  payment_method: Database["public"]["Enums"]["payment_method"];
  created_at: string | null;
  [key: string]: any; // Allow additional properties from database queries
}

export interface RefundValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Process a refund for a failed order
 * Validates refund eligibility, prevents duplicates, and credits the wallet
 */
export async function processOrderRefund(order: Order, adminUserId: string): Promise<RefundResult> {
  try {
    const adminClient = createAdminClient();

    // Handle edge cases first
    const edgeCaseResult = await handleRefundEdgeCases(order, adminUserId);
    
    if (edgeCaseResult.skipWalletRefund) {
      return {
        success: true,
        newBalance: 0,
        transactionId: `skip_${order.id}`
      };
    }

    // Validate refund amount (this will also log warnings for large amounts)
    const amountValidation = validateRefundAmount(order.total_price);
    if (!amountValidation.isValid) {
      // Log validation error
      await logWalletOperationError({
        operation: 'refund',
        userId: order.user_id,
        orderId: order.id,
        amount: order.total_price,
        error: amountValidation.error || 'Invalid refund amount',
        context: {
          validation_result: amountValidation,
        },
      });

      return {
        success: false,
        error: amountValidation.error
      };
    }

    // Check for duplicate refunds
    const isDuplicate = await checkDuplicateRefund(order.id);
    if (isDuplicate) {
      const duplicateError = 'Order has already been refunded';
      
      // Log duplicate refund attempt
      await logWalletOperationError({
        operation: 'refund',
        userId: order.user_id,
        orderId: order.id,
        amount: order.total_price,
        error: duplicateError,
        context: {
          duplicate_check: true,
          existing_refund_found: true,
        },
      });

      return {
        success: false,
        error: duplicateError
      };
    }

    // Process the wallet refund using the dedicated process_refund function
    const refundReference = `refund_${order.id}`;
    const description = `Refund for failed order ${order.id.slice(0, 8)}`;

    console.log(`Processing refund for order ${order.id}: ₦${order.total_price}`);

    // Use dedicated process_refund function that creates transaction with correct type
    const { data, error } = await adminClient.rpc('process_refund', {
      p_user_id: order.user_id,
      p_amount: order.total_price,
      p_description: description,
      p_order_id: order.id,
      p_reference: refundReference,
      p_created_by: adminUserId
    });

    if (error) {
      // Log refund processing error
      await logWalletOperationError({
        operation: 'refund',
        userId: order.user_id,
        orderId: order.id,
        amount: order.total_price,
        error: `Failed to process refund: ${error.message}`,
        context: {
          database_error: error,
          refund_reference: refundReference,
          description,
        },
      });

      return {
        success: false,
        error: `Failed to process refund: ${error.message}`
      };
    }

    console.log(`✅ Refund processed successfully for order ${order.id}`, {
      transactionId: refundReference,
      newBalance: data
    });

    return {
      success: true,
      newBalance: typeof data === 'number' ? data : undefined,
      transactionId: refundReference
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    // Log unexpected error
    await logWalletOperationError({
      operation: 'refund',
      userId: order.user_id,
      orderId: order.id,
      amount: order.total_price,
      error: `Unexpected error: ${errorMessage}`,
      context: {
        error_type: 'unexpected',
        stack_trace: error instanceof Error ? error.stack : undefined,
      },
    });

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Validate refund amount
 * Ensures the refund amount is valid and logs warnings for large amounts
 */
export function validateRefundAmount(amount: number): RefundValidationResult {
  // Allow zero and negative amounts (they will be skipped in processing)
  if (amount < 0) {
    console.log(`Negative refund amount detected: ₦${amount} - will be skipped in processing`);
    return {
      isValid: true // Will be handled as skip case
    };
  }

  if (amount === 0) {
    console.log(`Zero refund amount detected - will be skipped in processing`);
    return {
      isValid: true // Will be handled as skip case
    };
  }

  // Log warning for large refund amounts (over ₦100,000)
  if (amount > LARGE_REFUND_THRESHOLD) {
    if (amount > EXTREME_REFUND_THRESHOLD) {
      console.warn(`🚨 EXTREME refund amount detected: ₦${amount.toLocaleString()} - this amount is exceptionally large and should be reviewed`);
    } else {
      console.warn(`⚠️  Large refund amount detected: ₦${amount.toLocaleString()} - processing will continue but this amount exceeds normal thresholds`);
    }
  }

  return {
    isValid: true
  };
}

/**
 * Check if an order has already been refunded
 * Prevents duplicate refunds by checking for existing refund transactions
 */
export async function checkDuplicateRefund(orderId: string): Promise<boolean> {
  try {
    const adminClient = createAdminClient();
    
    const { data, error } = await adminClient
      .from("wallet_transactions")
      .select("id")
      .eq("order_id", orderId)
      .eq("transaction_type", "refund")
      .limit(1);

    if (error) {
      console.error("Error checking for duplicate refund:", error);
      // In case of error, allow the refund to proceed to avoid blocking legitimate refunds
      return false;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error("Exception checking for duplicate refund:", error);
    return false;
  }
}

/**
 * Get refund transaction details for an order
 * Useful for verification and audit purposes
 */
export async function getRefundTransaction(orderId: string): Promise<any | null> {
  try {
    const adminClient = createAdminClient();
    
    const { data, error } = await adminClient
      .from("wallet_transactions")
      .select(`
        *,
        created_by_user:users!wallet_transactions_created_by_fkey(
          id,
          full_name,
          email,
          role
        ),
        order:orders!wallet_transactions_order_id_fkey(
          id,
          total_price,
          status,
          payment_method
        )
      `)
      .eq("order_id", orderId)
      .eq("transaction_type", "refund")
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Get comprehensive refund audit trail for an order
 * Returns detailed information about the refund transaction and related data
 */
export async function getRefundAuditTrail(orderId: string): Promise<{
  transaction: any | null;
  auditLogs: any[];
  orderHistory: any | null;
}> {
  try {
    const adminClient = createAdminClient();
    
    // Get refund transaction with related data
    const transaction = await getRefundTransaction(orderId);
    
    // Get audit logs related to this order
    const { data: auditLogs } = await adminClient
      .from("admin_audit_logs")
      .select(`
        *,
        admin:users!admin_audit_logs_admin_id_fkey(
          id,
          full_name,
          email,
          role
        )
      `)
      .eq("entity_id", orderId)
      .eq("entity_type", "order")
      .order("created_at", { ascending: false });
    
    // Get order details
    const { data: orderHistory } = await adminClient
      .from("orders")
      .select(`
        *,
        user:users!orders_user_id_fkey(
          id,
          full_name,
          email,
          wallet_balance
        )
      `)
      .eq("id", orderId)
      .single();
    
    return {
      transaction,
      auditLogs: auditLogs || [],
      orderHistory
    };
  } catch (error) {
    console.error("Error getting refund audit trail:", error);
    return {
      transaction: null,
      auditLogs: [],
      orderHistory: null
    };
  }
}

/**
 * Validate transaction consistency and balance calculations
 * Ensures the refund transaction maintains proper audit trail
 */
export async function validateRefundTransaction(orderId: string): Promise<{
  isValid: boolean;
  errors: string[];
  details?: {
    transaction: any;
    expectedBalance: number;
    actualBalance: number;
    balanceMatch: boolean;
  };
}> {
  try {
    const adminClient = createAdminClient();
    const errors: string[] = [];
    
    // Get the refund transaction
    const transaction = await getRefundTransaction(orderId);
    if (!transaction) {
      return {
        isValid: false,
        errors: ["No refund transaction found for this order"]
      };
    }
    
    // Validate transaction fields
    if (!transaction.created_by) {
      errors.push("Transaction missing admin user tracking (created_by field)");
    }
    
    if (transaction.transaction_type !== 'refund') {
      errors.push(`Transaction type should be 'refund', found '${transaction.transaction_type}'`);
    }
    
    if (!transaction.order_id || transaction.order_id !== orderId) {
      errors.push("Transaction not properly linked to order");
    }
    
    if (!transaction.reference || !transaction.reference.startsWith('refund_')) {
      errors.push("Transaction missing proper refund reference");
    }
    
    // Validate balance calculations
    const expectedBalance = transaction.balance_before + transaction.amount;
    const balanceMatch = Math.abs(expectedBalance - transaction.balance_after) < 0.01; // Allow for floating point precision
    
    if (!balanceMatch) {
      errors.push(`Balance calculation error: expected ${expectedBalance}, got ${transaction.balance_after}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      details: {
        transaction,
        expectedBalance,
        actualBalance: transaction.balance_after,
        balanceMatch
      }
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Determine if a refund amount is considered an edge case
 * Returns classification and handling instructions
 */
export function classifyRefundAmount(amount: number): {
  type: 'zero' | 'negative' | 'normal' | 'large' | 'extreme';
  shouldSkip: boolean;
  requiresWarning: boolean;
  description: string;
} {
  if (amount === 0) {
    return {
      type: 'zero',
      shouldSkip: true,
      requiresWarning: false,
      description: 'Zero amount order - wallet refund will be skipped'
    };
  }
  
  if (amount < 0) {
    return {
      type: 'negative',
      shouldSkip: true,
      requiresWarning: true,
      description: `Negative amount order (₦${amount}) - wallet refund will be skipped`
    };
  }
  
  if (amount > EXTREME_REFUND_THRESHOLD) {
    return {
      type: 'extreme',
      shouldSkip: false,
      requiresWarning: true,
      description: `Extreme refund amount (₦${amount.toLocaleString()}) - requires review but will be processed`
    };
  }
  
  if (amount > LARGE_REFUND_THRESHOLD) {
    return {
      type: 'large',
      shouldSkip: false,
      requiresWarning: true,
      description: `Large refund amount (₦${amount.toLocaleString()}) - exceeds normal thresholds but will be processed`
    };
  }
  
  return {
    type: 'normal',
    shouldSkip: false,
    requiresWarning: false,
    description: `Normal refund amount (₦${amount.toLocaleString()})`
  };
}

/**
 * Handle edge cases for refund processing
 * Provides comprehensive logging and validation for unusual refund scenarios
 */
export async function handleRefundEdgeCases(order: Order, adminUserId: string): Promise<{
  shouldProceed: boolean;
  skipWalletRefund: boolean;
  warningLogged: boolean;
  message: string;
}> {
  const classification = classifyRefundAmount(order.total_price);
  
  // Handle zero and negative amounts
  if (classification.shouldSkip) {
    const skipMessage = `${classification.description} for order ${order.id}`;
    console.log(skipMessage);
    
    // Log the skip operation for audit purposes
    await logWalletOperationError({
      operation: 'refund',
      userId: order.user_id,
      orderId: order.id,
      amount: order.total_price,
      error: 'Refund skipped due to edge case amount',
      context: {
        edge_case_type: classification.type,
        skip_reason: classification.description,
        original_amount: order.total_price,
        action_taken: 'skip_wallet_refund_continue_processing'
      },
    });

    return {
      shouldProceed: true, // Continue with order status update
      skipWalletRefund: true,
      warningLogged: classification.requiresWarning,
      message: skipMessage
    };
  }
  
  // Handle large and extreme amounts
  if (classification.requiresWarning) {
    const warningMessage = `${classification.description} for order ${order.id}, User: ${order.user_id}`;
    
    if (classification.type === 'extreme') {
      console.warn(`🚨 ${warningMessage}`);
    } else {
      console.warn(`⚠️  ${warningMessage}`);
    }
    
    // Log large refund for audit purposes
    await logWalletOperationError({
      operation: 'refund',
      userId: order.user_id,
      orderId: order.id,
      amount: order.total_price,
      error: `${classification.type.toUpperCase()} refund amount warning`,
      context: {
        warning_type: classification.type + '_refund_amount',
        threshold: classification.type === 'extreme' ? EXTREME_REFUND_THRESHOLD : LARGE_REFUND_THRESHOLD,
        actual_amount: order.total_price,
        action_taken: 'continue_processing_with_warning',
        requires_review: classification.type === 'extreme',
        classification: classification
      },
    });

    return {
      shouldProceed: true,
      skipWalletRefund: false,
      warningLogged: true,
      message: warningMessage
    };
  }
  
  // Normal amount - no special handling needed
  return {
    shouldProceed: true,
    skipWalletRefund: false,
    warningLogged: false,
    message: classification.description
  };
}