export interface Service {
  id: string;
  platform: string;
  service_type: string;
  price_per_1k: number;
  high_quality_price_per_1k?: number;
  low_quality_price_per_1k?: number;
  is_active: boolean;
  min_quantity: number;
  max_quantity: number;
  delivery_time: string;
  description?: string;
}

export interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  is_active: boolean;
}

export interface UserData {
  id: string;
  wallet_balance: number;
  full_name: string;
  whatsapp_no?: string;
}