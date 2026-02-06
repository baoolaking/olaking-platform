// TikTok Coin Package Types

export interface TikTokCoinPackage {
  id: string;
  coins: number;
  price: number;
  display_price: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TikTokCoinPackageInput {
  coins: number;
  price: number;
  display_price?: string;
  is_popular?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export interface TikTokCoinPackageUpdate {
  coins?: number;
  price?: number;
  display_price?: string;
  is_popular?: boolean;
  is_active?: boolean;
  sort_order?: number;
}
