# Wallet Balance Revalidation Implementation

## Overview

This implementation ensures that wallet amounts are automatically updated across all dashboard components when a service order is placed and the wallet amount is deducted.

## Key Features

1. **Real-time Balance Updates**: Wallet balance updates immediately across all components
2. **Optimistic UI Updates**: Better user experience with instant visual feedback
3. **Server-side Cache Invalidation**: Next.js cache revalidation for server components
4. **Error Handling**: Automatic rollback of optimistic updates on failure
5. **Global State Management**: Event-driven updates across components
6. **Cross-Page Synchronization**: Balance updates sync across all dashboard pages
7. **Visibility-based Refresh**: Automatic refresh when user returns to the page
8. **Focus-based Refresh**: Automatic refresh when window regains focus

## Architecture

### 1. API Layer Enhancements

#### `/api/wallet/deduct` Route
- **Enhanced Response**: Now returns the updated wallet balance
- **Server Cache Invalidation**: Uses `revalidatePath()` for server components
- **Consistent Error Handling**: Proper error responses with balance information

```typescript
return NextResponse.json({ 
  success: true, 
  newBalance,
  message: "Wallet deducted successfully"
});
```

#### `/api/wallet/credit` Route
- **Consistent Response**: Also returns updated balance for consistency
- **Same Cache Invalidation**: Revalidates all wallet-related pages

### 2. Client-side State Management

#### Wallet Context (`hooks/use-wallet-context.tsx`)
- **Global Event System**: Uses custom events for cross-component communication
- **Broadcast Updates**: `broadcastWalletUpdate()` function for triggering updates
- **Update Listeners**: `useWalletUpdates()` hook for components to listen to changes
- **Manual Refresh**: `triggerWalletRefresh()` function for forcing refreshes
- **Visibility Detection**: Automatic refresh when page becomes visible
- **Focus Detection**: Automatic refresh when window regains focus

```typescript
// Broadcast wallet update
broadcastWalletUpdate(newBalance);

// Trigger manual refresh
triggerWalletRefresh();

// Listen for updates in components
useWalletUpdates((newBalance) => {
  if (newBalance === -1) {
    // Refresh signal - reload data
    refreshUserData();
  } else {
    // Direct balance update
    updateLocalBalance(newBalance);
  }
});
```

#### Optimistic Updates (`hooks/use-optimistic-wallet.ts`)
- **Instant UI Feedback**: Shows balance changes immediately
- **Confirmation/Rollback**: Confirms with server response or reverts on error
- **Visual Indicators**: Shows "updating..." states during operations

```typescript
const {
  balance: displayBalance,
  isOptimistic,
  optimisticDeduct,
  confirmDeduction,
  revertOptimistic,
} = useOptimisticWallet(initialBalance);
```

### 3. Component Updates

#### Order Form Modal (`components/services/order-form-modal.tsx`)
- **Optimistic Deduction**: Immediately shows reduced balance
- **Server Confirmation**: Confirms with actual balance from API
- **Error Recovery**: Reverts optimistic changes on failure

#### Wallet Balance Components
- **Real-time Updates**: Listen for wallet events and update display
- **Loading States**: Show updating indicators during operations
- **Consistent Formatting**: Use same currency formatting across components
- **Dashboard Header**: Shows wallet balance in the top navigation bar
- **Services Page Display**: Shows balance on services browsing page
- **Wallet Page Card**: Main wallet balance display on wallet page

## Implementation Flow

### Service Order with Wallet Payment

1. **User Initiates Order**
   - Order form validates sufficient balance
   - Optimistic deduction shows immediate balance reduction

2. **API Processing**
   - Order created in database
   - Wallet deduction API called with order details
   - Database function safely deducts amount
   - Updated balance returned in response

3. **Client-side Updates**
   - Optimistic update confirmed with actual balance
   - Global event broadcast to all components
   - All wallet displays update simultaneously (header, services page, wallet page)

4. **Error Handling**
   - If API fails, optimistic update is reverted
   - User sees original balance and error message
   - No inconsistent state across components

## Files Modified/Created

### New Files
- `hooks/use-wallet-context.tsx` - Global wallet state management
- `hooks/use-optimistic-wallet.ts` - Optimistic UI updates
- `components/debug/wallet-update-test.tsx` - Testing component

### Modified Files
- `app/api/wallet/deduct/route.ts` - Enhanced to return new balance
- `app/api/wallet/credit/route.ts` - Consistent response format
- `components/services/order-form-modal.tsx` - Optimistic updates
- `components/services/wallet-balance-display.tsx` - Real-time updates
- `components/dashboard/wallet/wallet-balance-card.tsx` - Real-time updates
- `components/dashboard/DashboardHeader.tsx` - Real-time header balance updates
- `hooks/use-services.ts` - Wallet update listeners and broadcasting
- `hooks/use-wallet.ts` - Wallet update listeners and broadcasting
- `hooks/use-wallet-context.tsx` - Enhanced with visibility and focus detection

## Usage Examples

### Broadcasting Wallet Updates
```typescript
import { broadcastWalletUpdate } from "@/hooks/use-wallet-context";

// After successful wallet operation
const response = await fetch("/api/wallet/deduct", { ... });
const result = await response.json();
if (result.newBalance) {
  broadcastWalletUpdate(result.newBalance);
}
```

### Listening for Updates in Components
```typescript
import { useWalletUpdates } from "@/hooks/use-wallet-context";

function MyWalletComponent() {
  const [balance, setBalance] = useState(initialBalance);
  
  useWalletUpdates((newBalance) => {
    if (newBalance !== -1) {
      setBalance(newBalance);
    }
  });
  
  return <div>Balance: {balance}</div>;
}
```

### Optimistic Updates
```typescript
import { useOptimisticWallet } from "@/hooks/use-optimistic-wallet";

function OrderForm() {
  const { balance, optimisticDeduct, confirmDeduction, revertOptimistic } = 
    useOptimisticWallet(userBalance);
  
  const handleOrder = async () => {
    // Show immediate feedback
    optimisticDeduct(orderAmount);
    
    try {
      const response = await createOrder();
      confirmDeduction(response.newBalance);
    } catch (error) {
      revertOptimistic();
    }
  };
}
```

## Testing

### Manual Testing
1. Navigate to services page
2. Note current wallet balance
3. Place an order with wallet payment
4. Verify balance updates immediately across all components
5. Check that balance is consistent on page refresh

### Debug Component
Use the `WalletSyncTest` component to test the synchronization mechanism:
```typescript
import { WalletSyncTest } from "@/components/debug/wallet-sync-test";

// Add to any page for testing
<WalletSyncTest />
```

### Cross-Page Testing
1. Open multiple dashboard pages (wallet, services, main dashboard)
2. Perform wallet operations on one page
3. Verify all pages update simultaneously
4. Test tab switching and window focus behavior

## Benefits

1. **Improved UX**: Instant feedback on wallet operations across all pages
2. **Consistency**: All components show the same balance at all times
3. **Reliability**: Server-side validation with client-side optimization
4. **Maintainability**: Centralized wallet state management
5. **Performance**: Efficient event-driven updates
6. **Cross-Page Sync**: Balance updates work across browser tabs and page navigation
7. **Automatic Recovery**: System recovers from missed updates when user returns

## Future Enhancements

1. **WebSocket Integration**: Real-time updates from server events
2. **Offline Support**: Queue operations when offline
3. **Transaction History**: Real-time transaction list updates
4. **Multi-tab Sync**: Sync wallet state across browser tabs
5. **Push Notifications**: Notify users of wallet changes