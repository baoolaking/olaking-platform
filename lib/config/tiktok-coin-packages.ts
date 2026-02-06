// TikTok Coin Packages Configuration
// Based on official TikTok pricing

export interface TikTokCoinPackage {
  coins: number;
  price: number;
  displayPrice: string;
  isPopular?: boolean;
}

export const TIKTOK_COIN_PACKAGES: TikTokCoinPackage[] = [
  {
    coins: 200,
    price: 4000,
    displayPrice: "₦4,000"
  },
  {
    coins: 500,
    price: 10000,
    displayPrice: "₦10,000"
  },
  {
    coins: 1000,
    price: 20000,
    displayPrice: "₦20,000"
  },
  {
    coins: 1500,
    price: 30000,
    displayPrice: "₦30,000",
    isPopular: true
  },
  {
    coins: 5000,
    price: 100000,
    displayPrice: "₦100,000"
  },
  {
    coins: 10000,
    price: 200000,
    displayPrice: "₦200,000"
  }
];

/**
 * Get formatted package description for WhatsApp message
 */
export function getPackageDescription(pkg: TikTokCoinPackage): string {
  return `${pkg.coins} coins for ${pkg.displayPrice}`;
}

/**
 * Get all packages as a formatted list for WhatsApp
 */
export function getAllPackagesText(): string {
  return TIKTOK_COIN_PACKAGES.map((pkg, index) => 
    `${index + 1}. ${pkg.coins} coins - ${pkg.displayPrice}`
  ).join('\n');
}

/**
 * Format WhatsApp message with package selection
 */
export function formatWhatsAppMessage(selectedPackage?: TikTokCoinPackage): string {
  if (selectedPackage) {
    return `Hi! I would like to purchase ${selectedPackage.coins} TikTok coins for ${selectedPackage.displayPrice}.\n\nCan you help me complete this order?`;
  }
  
  return `Hi! I'm interested in purchasing TikTok coins.\n\nAvailable packages:\n${getAllPackagesText()}\n\nPlease let me know how to proceed with the purchase.`;
}
