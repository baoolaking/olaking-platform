# Admin Orders Components

This directory contains modular components for the admin orders management page, providing better maintainability and responsive design.

## Components

### `order-stats.tsx`
- **Purpose**: Displays key order statistics and metrics
- **Features**: 
  - Total orders, pending, completed, awaiting payment counts
  - Total revenue calculation
  - Responsive grid layout (2 columns on mobile, 5 on desktop)
  - Real-time updates based on current orders data

### `admin-order-filters.tsx`
- **Purpose**: Provides comprehensive filtering and search functionality
- **Features**:
  - Search by order ID, username, full name, platform, or link
  - Filter by status, payment method, and date range
  - Clear filters functionality with visual feedback
  - Results summary showing filtered vs total counts
  - Mobile-responsive filter grid layout

### `orders-table.tsx`
- **Purpose**: Displays orders in a responsive table format
- **Features**:
  - Uses ResponsiveTable component for mobile optimization
  - Compact display with essential order information
  - Action buttons for editing orders and updating wallets
  - Status badges with color coding
  - Mobile-friendly card layout with key information
  - Truncated text for long links and descriptions

### `edit-order-dialog.tsx`
- **Purpose**: Modal dialog for editing order status and admin notes
- **Features**:
  - Status dropdown with all available order statuses
  - Admin notes textarea for detailed comments
  - Loading states during updates
  - Form validation and error handling
  - Automatic timestamp updates based on status changes

### `wallet-update-dialog.tsx`
- **Purpose**: Modal dialog for updating user wallet balances
- **Features**:
  - Add or subtract funds from user wallets
  - Amount input with validation
  - Visual icons for add/subtract actions
  - Loading states and error handling
  - Automatic transaction logging
  - Balance validation to prevent negative balances

## Hooks

### `use-admin-orders.ts`
- **Purpose**: Manages admin orders data and operations
- **Features**:
  - Fetches orders with user and service details
  - Real-time order status updates
  - Wallet balance management with transaction logging
  - Error handling with user feedback
  - Authentication checks with redirect

### `use-admin-order-filters.ts`
- **Purpose**: Handles all filtering and search logic
- **Features**:
  - Multiple filter types (status, payment, date, search)
  - Memoized filtering for performance
  - Active filters detection
  - Filter state management
  - Search across multiple order fields

## Mobile Responsiveness

### Table Display
- **Desktop**: Full table with all columns visible
- **Mobile**: Card-based layout with essential information
- **Responsive**: Automatic switching based on screen size
- **Touch Optimized**: Larger buttons and better spacing

### Layout Improvements
- **Stats Grid**: 2 columns on mobile, 5 on desktop
- **Filter Grid**: Stacked on mobile, 4 columns on desktop
- **Action Buttons**: Smaller size with icon-only display on mobile
- **Typography**: Responsive font sizes and spacing

### Dialog Optimization
- **Mobile Friendly**: Proper sizing and spacing on small screens
- **Touch Targets**: Minimum 44px for all interactive elements
- **Keyboard Support**: Full keyboard navigation support

## Features

### Order Management
- **Status Updates**: Change order status with automatic timestamp updates
- **Admin Notes**: Add detailed notes for order tracking
- **Bulk Operations**: Foundation for future bulk update features
- **Audit Trail**: Automatic logging of status changes

### Wallet Management
- **Balance Updates**: Add or subtract funds from user wallets
- **Transaction Logging**: Automatic creation of wallet transaction records
- **Balance Validation**: Prevents negative balance operations
- **Admin Attribution**: Links wallet changes to admin user

### Filtering & Search
- **Multi-field Search**: Search across order ID, usernames, platforms
- **Date Filtering**: Today, last 7 days, last 30 days options
- **Status Filtering**: Filter by any order status
- **Payment Method**: Filter by wallet or bank transfer
- **Real-time Results**: Instant filtering as user types

### Pagination
- **Performance**: Only loads 10 orders per page
- **Navigation**: Previous/Next with page numbers
- **Mobile Optimized**: Simplified controls on small screens
- **Filter Integration**: Resets to page 1 when filters change

## Usage

```tsx
import { AdminOrdersPage } from './page';

// The main page component orchestrates all admin functionality
// Individual components can be used separately if needed

// Example: Using just the order stats
import { OrderStats } from '@/components/admin/orders/order-stats';
import { useAdminOrders } from '@/hooks/use-admin-orders';

function MyComponent() {
  const { orders } = useAdminOrders();
  
  return <OrderStats orders={orders} />;
}
```

## Performance Considerations

- **Memoized Filtering**: Efficient filtering with useMemo
- **Pagination**: Limits rendered orders for better performance
- **Lazy Loading**: Components split for better code splitting
- **Optimistic Updates**: Local state updates before server confirmation

## Security Features

- **Authentication**: Automatic redirect if not authenticated
- **Authorization**: Admin-only access to order management
- **Audit Logging**: All changes are logged with admin attribution
- **Input Validation**: Client and server-side validation

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Status colors meet WCAG standards
- **Focus Management**: Proper focus handling in dialogs and forms
- **Touch Targets**: Minimum 44px touch targets for mobile users

## Error Handling

- **Network Errors**: Graceful handling of connection issues
- **Validation Errors**: Clear error messages for invalid inputs
- **Permission Errors**: Proper handling of unauthorized actions
- **Loading States**: Visual feedback during operations