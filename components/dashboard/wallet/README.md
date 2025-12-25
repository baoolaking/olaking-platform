# Wallet Components

This directory contains modular components for the wallet page, providing better maintainability and mobile responsiveness.

## Components

### `wallet-balance-card.tsx`
- **Purpose**: Displays current wallet balance and fund wallet button
- **Features**: 
  - Gradient background with primary color theme
  - Mobile-responsive text sizing
  - Loading states and polling indicators
  - Disabled states during operations

### `funding-form.tsx`
- **Purpose**: Form for creating wallet funding requests
- **Features**:
  - Form validation with Zod schema
  - Bank account selection dropdown
  - Minimum amount validation
  - Mobile-responsive button layout
  - Loading states during submission

### `payment-instructions.tsx`
- **Purpose**: Shows bank transfer details for pending payments
- **Features**:
  - Copy-to-clipboard functionality for all payment details
  - Mobile-responsive layout with proper spacing
  - Visual feedback for copy actions
  - Highlighted payment amount

### `transaction-card.tsx`
- **Purpose**: Individual transaction display in card format
- **Features**:
  - Color-coded transaction types (credit/debit/refund)
  - Mobile-optimized layout with proper text wrapping
  - Status badges with appropriate colors
  - Responsive typography

### `transactions-table.tsx`
- **Purpose**: Table view for transaction history
- **Features**:
  - Horizontal scrolling on mobile
  - Sortable columns with proper spacing
  - Color-coded amounts and status indicators
  - Responsive date/time formatting

### `transaction-history.tsx`
- **Purpose**: Main container for transaction display with view toggle
- **Features**:
  - View toggle between cards and table (desktop only)
  - Pagination for large transaction lists
  - Empty state handling
  - Mobile-first responsive design
  - Automatic fallback to card view on mobile

## Hooks

### `use-wallet.ts`
- **Purpose**: Manages wallet data fetching and state
- **Features**:
  - User data, bank accounts, and transactions loading
  - Authentication checks with redirect
  - Error handling with toast notifications
  - Configurable minimum funding amounts

### `use-wallet-funding.ts`
- **Purpose**: Handles wallet funding operations
- **Features**:
  - Funding request creation
  - Payment status polling
  - Real-time payment confirmation
  - Error handling for database constraints

## Mobile Responsiveness Improvements

### Transaction Display
- **Card View**: Optimized for mobile with better spacing and touch targets
- **Table View**: Hidden on mobile, horizontal scroll on tablets
- **View Toggle**: Hidden on mobile devices (< 768px)

### Layout Improvements
- **Responsive Grid**: Adapts to screen size with proper breakpoints
- **Touch Targets**: Minimum 44px for all interactive elements
- **Typography**: Scaled font sizes for better mobile readability
- **Spacing**: Improved padding and margins for mobile devices

### Pagination
- **Mobile-Friendly**: Simplified pagination controls on small screens
- **Touch Optimized**: Larger buttons with proper spacing
- **Page Indicators**: Compact display for very small screens

## Usage

```tsx
import { WalletPage } from './page';

// The main page component orchestrates all wallet functionality
// Individual components can be used separately if needed

// Example: Using just the transaction history
import { TransactionHistory } from '@/components/dashboard/wallet/transaction-history';
import { useWallet } from '@/hooks/use-wallet';

function MyComponent() {
  const { transactions } = useWallet();
  
  return <TransactionHistory transactions={transactions} />;
}
```

## Features

### Real-time Updates
- **Payment Polling**: Automatic checking for payment confirmations
- **Live Balance**: Real-time wallet balance updates
- **Status Notifications**: Toast notifications for payment status changes

### Copy Functionality
- **Payment Details**: One-click copy for bank details
- **Transaction References**: Easy copying of transaction IDs
- **Visual Feedback**: Clear indication when items are copied

### Error Handling
- **Database Constraints**: Specific error messages for common issues
- **Network Errors**: Graceful handling of connection issues
- **Validation**: Client-side and server-side validation

## Performance Considerations

- **Pagination**: Limits displayed transactions for better performance
- **Memoization**: Efficient re-rendering with proper dependencies
- **Lazy Loading**: Components split for better code splitting
- **Polling Optimization**: Smart polling that stops when not needed

## Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Transaction status colors meet WCAG standards
- **Touch Targets**: Minimum 44px touch targets for mobile users
- **Focus Management**: Proper focus handling in forms and modals