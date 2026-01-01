import { z } from "zod";

export const fundWalletSchema = z.object({
  amount: z
    .number()
    .min(1, "Amount must be greater than 0")
    .max(1000000, "Amount cannot exceed ₦1,000,000"),
  bank_account_id: z.string().min(1, "Please select a bank account"),
});

export const serviceOrderSchema = z.object({
  service_id: z.string().min(1, "Please select a service"),
  platform: z.enum([
    "tiktok",
    "instagram", 
    "facebook",
    "youtube",
    "x",
    "whatsapp",
    "telegram"
  ]),
  service_type: z.string().min(1, "Service type is required"),
  quantity: z
    .number()
    .min(100, "Minimum quantity is 100")
    .max(500000, "Maximum quantity is 500,000"),
  link: z.string().url("Please enter a valid URL"),
  quality_type: z.enum(["high_quality", "low_quality"]),
  payment_method: z.enum(["wallet", "bank_transfer"]), // Currently only wallet is supported
  bank_account_id: z.string().optional(), // Not required since only wallet payments are supported
});

export const adminWalletActionSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  action: z.enum(["credit", "debit", "refund"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().optional(),
});

export type FundWalletInput = z.infer<typeof fundWalletSchema>;
export type ServiceOrderInput = z.infer<typeof serviceOrderSchema>;
export type AdminWalletActionInput = z.infer<typeof adminWalletActionSchema>;

// Platform-specific service type enums for validation
export const platformServiceTypes = {
  tiktok: [
    "coin",
    "followers", 
    "views",
    "video comments",
    "add to favorites",
    "likes",
    "shares",
    "live views"
  ],
  instagram: [
    "save post",
    "page follow",
    "post likes",
    "post repost",
    "post comments",
    "post views",
    "share to story",
    "reel sound use",
    "vote"
  ],
  facebook: [
    "page like",
    "video view",
    "group join",
    "video share",
    "post comments",
    "post likes",
    "post share",
    "post review",
    "page follow"
  ],
  youtube: [
    "video like",
    "video view",
    "video share",
    "video comments",
    "channel subscribe",
    "5 min watch hour"
  ],
  x: [
    "repost with quote",
    "tweet repost",
    "tweet comments",
    "tweet like",
    "page follow",
    "tweet views"
  ],
  whatsapp: [
    "channel post like",
    "community",
    "group",
    "contact save",
    "channel follow"
  ],
  telegram: [
    "channel/group members"
  ]
} as const;

export type Platform = keyof typeof platformServiceTypes;
export type ServiceType<T extends Platform> = typeof platformServiceTypes[T][number];

/**
 * Validate if a service type is valid for a given platform
 */
export function validatePlatformServiceType(
  platform: Platform,
  serviceType: string
): serviceType is ServiceType<typeof platform> {
  return (platformServiceTypes[platform] as readonly string[]).includes(serviceType);
}

/**
 * Get available service types for a platform
 */
export function getServiceTypesForPlatform(platform: Platform): readonly string[] {
  return platformServiceTypes[platform];
}

/**
 * Format service type for display
 */
export function formatServiceType(serviceType: string): string {
  return serviceType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format platform name for display
 */
export function formatPlatformName(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return 'TikTok';
    case 'instagram':
      return 'Instagram';
    case 'facebook':
      return 'Facebook';
    case 'youtube':
      return 'YouTube';
    case 'x':
      return 'X (Twitter)';
    case 'whatsapp':
      return 'WhatsApp';
    case 'telegram':
      return 'Telegram';
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
}