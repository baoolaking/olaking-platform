# TikTok Coins Integration Setup

This document explains how to configure and customize the TikTok coins promotion feature in your application.

## Configuration

### Environment Variable Setup
The TikTok coins feature uses the `NEXT_PUBLIC_WHATSAPP_TIKTOK_COINS` environment variable for the WhatsApp number. 

**In your `.env.local` file:**
```env
NEXT_PUBLIC_WHATSAPP_TIKTOK_COINS=+2349163313727
```

The system automatically:
- Removes the `+` sign for WhatsApp URL compatibility
- Uses this number for all TikTok coin related WhatsApp contacts
- Falls back to a default number if the environment variable is not set

### Message Customization
You can customize the default message in `lib/config/tiktok-coins.ts`:

```typescript
defaultMessage: "Hi! I'm interested in purchasing TikTok coins. Can you help me?",
```

## Features Included

### 1. Landing Page Popup
- Automatically appears 3 seconds after page load
- Eye-catching modal with TikTok coin branding
- Direct WhatsApp integration
- **Mobile responsive design**

### 2. Dashboard Banner
- Prominent banner at the top of the dashboard home page
- Gradient design with TikTok coin logo
- Dismissible by users
- **Fully mobile responsive with adaptive text and button sizes**

### 3. Quick Action Card
- Dedicated TikTok coins card in the dashboard quick actions
- Uses user's WhatsApp number from their profile
- Prominent call-to-action button

### 4. Floating Button
- Animated floating button on all dashboard pages
- Bottom-right position by default
- Always accessible for users
- **Mobile responsive sizing (smaller on mobile, larger on desktop)**
- **Fixed issue: Now works properly after closing and reopening**

### 5. Service & Wallet Page Banners
- Additional promotion banners on services and wallet pages
- Contextually relevant placement
- **Mobile responsive design**

## Recent Fixes

### ✅ Server Component Error Fixed
- **Problem**: "Event handlers cannot be passed to Client Component props" error in dashboard
- **Solution**: Extracted TikTok coin quick action into separate client component (`TikTokCoinQuickAction.tsx`)

### ✅ Floating Button Issue Fixed
- **Problem**: After clicking the floating button and closing the modal, clicking again wouldn't work
- **Solution**: Refactored to use proper state management with single popup instance and onClose callback

### ✅ Mobile Responsiveness Added
- **Banner**: Responsive padding, text sizes, and button layout
- **Floating Button**: Smaller size on mobile (48px) vs desktop (64px)
- **Popup Modal**: Responsive sizing and spacing for mobile devices
- **Text**: Adaptive font sizes and spacing for different screen sizes

## Mobile Responsive Features

### Banner Responsiveness
- Smaller padding on mobile (`p-3` vs `p-4`)
- Responsive image sizing (40px mobile, 48px desktop)
- Adaptive text sizes (`text-base` mobile, `text-lg` desktop)
- Compact button with "Buy" text on very small screens

### Floating Button Responsiveness
- Mobile: 48px × 48px with 24px icon
- Desktop: 64px × 64px with 32px icon
- Responsive positioning (closer to edges on mobile)

### Popup Modal Responsiveness
- Constrained width on mobile (`max-w-[90vw]`)
- Responsive image and text sizing
- Adaptive spacing and padding

## Customization Options

### Disable Features
You can disable specific features by updating the configuration:

```typescript
banner: {
  showOnDashboard: false,  // Disable dashboard banner
  showOnServices: false,   // Disable services page banner
  showOnWallet: false,     // Disable wallet page banner
},

floatingButton: {
  enabled: false,          // Disable floating button
}
```

### Change Floating Button Position
```typescript
floatingButton: {
  position: "bottom-left", // Options: "bottom-right", "bottom-left", "top-right", "top-left"
}
```

### Adjust Popup Timing
```typescript
popup: {
  autoShowDelay: 5000,     // Show popup after 5 seconds instead of 3
}
```

## File Locations

- **Configuration**: `lib/config/tiktok-coins.ts`
- **Components**: `components/common/TikTok*`
  - `TikTokCoinPopup.tsx` - Modal popup component
  - `TikTokCoinBanner.tsx` - Banner component for pages
  - `TikTokCoinFloatingButton.tsx` - Floating action button
  - `TikTokCoinQuickAction.tsx` - Quick action card for dashboard
- **TikTok Coin Image**: `public/images/tiktok-coin.png`

## Testing

1. **Set Environment Variable**: Ensure `NEXT_PUBLIC_WHATSAPP_TIKTOK_COINS` is set in your `.env.local` file
2. **Test the popup** on the landing page
3. **Check the dashboard banner** and quick action
4. **Test floating button multiple times** (click, close, click again)
5. **Test on mobile devices** for responsive design
6. **Verify WhatsApp integration** by clicking any TikTok coin button - should open WhatsApp with the configured number

## Notes

- **Centralized Configuration**: All TikTok coin WhatsApp contacts use the `NEXT_PUBLIC_WHATSAPP_TIKTOK_COINS` environment variable
- **Automatic Formatting**: The system handles `+` sign removal for WhatsApp URL compatibility
- **Fallback Support**: If environment variable is not set, falls back to a default number
- **No User Data Dependency**: Components no longer depend on user's personal WhatsApp number
- All components are fully responsive and optimized for mobile devices
- The floating button now properly handles state management for repeated use
- The TikTok coin image should be placed at `public/images/tiktok-coin.png`