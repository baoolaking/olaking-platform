// TikTok Coins Configuration
export const TIKTOK_COINS_CONFIG = {
  // WhatsApp number from environment variable (remove + sign for WhatsApp URL format)
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_TIKTOK_COINS?.replace('+', '') || "2349163313727",
  
  // Default message for TikTok coin purchases
  defaultMessage: "Hi! I'm interested in purchasing TikTok coins. Can you help me?",
  
  // Popup settings
  popup: {
    autoShowDelay: 3000, // 3 seconds
    showOnLandingPage: true,
  },
  
  // Banner settings
  banner: {
    showOnDashboard: true,
    showOnServices: true,
    showOnWallet: true,
  },
  
  // Floating button settings
  floatingButton: {
    enabled: true,
    position: "bottom-right" as const,
  }
};

export function getTikTokCoinsWhatsAppUrl(whatsappNumber?: string, customMessage?: string) {
  // Use provided number, or fallback to config number
  let number = whatsappNumber || TIKTOK_COINS_CONFIG.whatsappNumber;
  
  // Remove + sign if present for WhatsApp URL format
  if (number?.startsWith('+')) {
    number = number.substring(1);
  }
  
  const message = customMessage || TIKTOK_COINS_CONFIG.defaultMessage;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}