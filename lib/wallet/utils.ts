import { createClient } from "@/lib/supabase/client";

export interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: 'credit' | 'debit' | 'refund';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference?: string;
  order_id?: string;
  created_by?: string;
  created_at: string;
}

export interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  is_active: boolean;
  sort_order: number;
}

/**
 * Get user's current wallet balance
 */
export async function getUserWalletBalance(userId: string): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("users")
    .select("wallet_balance")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to get wallet balance: ${error.message}`);
  }

  return data?.wallet_balance || 0;
}

/**
 * Get user's wallet transaction history
 */
export async function getWalletTransactions(
  userId: string,
  limit: number = 20
): Promise<WalletTransaction[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get active bank accounts for payments
 */
export async function getActiveBankAccounts(): Promise<BankAccount[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to get bank accounts: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a wallet funding request (creates an order with special handling)
 */
export async function createWalletFundingRequest(
  userId: string,
  amount: number,
  bankAccountId: string
): Promise<string> {
  const supabase = createClient();
  
  // Create a special order for wallet funding with service_id as null
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      service_id: null, // Explicitly null for wallet funding
      quantity: 1, // Quantity = 1 for wallet funding
      price_per_1k: amount, // Store the funding amount here
      total_price: amount,
      status: "awaiting_payment",
      link: "wallet_funding", // Special identifier for wallet funding
      quality_type: "high_quality",
      payment_method: "bank_transfer",
      bank_account_id: bankAccountId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create funding request: ${error.message}`);
  }

  return data.id;
}

/**
 * Check if user has sufficient wallet balance for a purchase
 */
export async function checkSufficientBalance(
  userId: string,
  requiredAmount: number
): Promise<boolean> {
  const currentBalance = await getUserWalletBalance(userId);
  return currentBalance >= requiredAmount;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

/**
 * Get minimum wallet funding amount from admin settings
 */
export async function getMinimumFundingAmount(): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("admin_settings")
    .select("setting_value")
    .eq("setting_key", "min_wallet_funding")
    .single();

  if (error || !data) {
    return 500; // Default minimum
  }

  return parseInt(data.setting_value) || 500;
}

/**
 * Get WhatsApp contact numbers from admin settings
 */
export async function getWhatsAppContacts(): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("admin_settings")
    .select("setting_key, setting_value")
    .in("setting_key", ["whatsapp_contact_1", "whatsapp_contact_2"]);

  if (error || !data) {
    return ["+234 901 799 2518", "+234 916 331 3727"]; // Default contacts
  }

  return data.map(setting => setting.setting_value);
}

/**
 * Calculate service price based on quantity and price per 1k
 */
export function calculateServicePrice(quantity: number, pricePer1k: number): number {
  return Math.ceil((quantity / 1000) * pricePer1k);
}

/**
 * Validate service quantity within allowed limits
 */
export function validateServiceQuantity(
  quantity: number,
  minQuantity: number = 100,
  maxQuantity: number = 500000
): { isValid: boolean; error?: string } {
  if (quantity < minQuantity) {
    return {
      isValid: false,
      error: `Minimum quantity is ${minQuantity.toLocaleString()}`,
    };
  }

  if (quantity > maxQuantity) {
    return {
      isValid: false,
      error: `Maximum quantity is ${maxQuantity.toLocaleString()}`,
    };
  }

  return { isValid: true };
}

/**
 * Generate a unique reference for transactions
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN_${timestamp}_${random}`.toUpperCase();
}