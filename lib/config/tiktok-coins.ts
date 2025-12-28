// TikTok Coins Configuration
export const TIKTOK_COINS_CONFIG = {
  // Replace with your actual WhatsApp number (include country code without +)
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_TIKTOK_COINS, // e.g., "2348123456789"
  
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
  const number = whatsappNumber || TIKTOK_COINS_CONFIG.whatsappNumber;
  const message = customMessage || TIKTOK_COINS_CONFIG.defaultMessage;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}