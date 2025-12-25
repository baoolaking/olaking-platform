# Orders Components

This directory contains modular components for the orders page, making it more maintainable and reusable.

## Components

### `order-card.tsx`
- **Purpose**: Displays individual order information in a card format
- **Features**: 
  - Mobile-responsive design with improved grid layouts
  - Copy-to-clipboard functionality for payment details
  - Expandable payment instructions for bank transfers
  - Status badges with icons
  - Optimized for touch interactions on mobile

### `order-filters.tsx`
- **Purpose**: Provides filtering and search functionality
- **Features**:
  - Search by order ID, platform, or link
  - Filter by status, payment method, and date range
  - Clear filters functionality
  - Results summary display
  - Mobile-responsive filter grid

### `orders-table.tsx`
- **Purpose**: Alternative table view for orders
- **Features**:
  - Compact table layout for desktop users
  - Expandable rows for detailed information
  - Mobile-responsive with horizontal scrolling
  - Quick actions (copy, external links)
  - Optimized for data scanning

### `pagination.tsx`
- **Purpose**: Handles pagination for order lists
- **Features**:
  - Smart page number display (shows 5 pages max)
  - Mobile-friendly with simplified controls
  - Previous/Next navigation
  - Page indicator for very small screens

### `empty-state.tsx`
- **Purpose**: Shows appropriate message when no orders are found
- **Features**:
  - Different messages for filtered vs empty states
  - Action buttons to guide users
  - Mobile-responsive layout

## Hooks

### `use-orders.ts`
- **Purpose**: Manages order data fetching and real-time updates
- **Features**:
  - Supabase integration with real-time subscriptions
  - Loading and refresh states
  - Error handling
  - Authentication checks

### `use-order-filters.ts`
- **Purpose**: Handles all filtering logic
- **Features**:
  - Multiple filter types (status, payment, date, search)
  - Memoized filtering for performance
  - Filter state management
  - Active filters detection

### `use-pagination.ts`
- **Purpose**: Generic pagination hook
- **Features**:
  - Configurable items per page
  - Auto-reset when data changes
  - Page navigation controls
  - Reusable across different components

## Mobile Responsiveness Improvements

### Grid Layouts
- Order details use responsive grids (2 columns on mobile, 4 on desktop)
- Better spacing and touch targets on mobile devices
- Improved text wrapping and overflow handling

### Typography
- Smaller font sizes on mobile for better content density
- Better line height and spacing for readability
- Truncated text with proper ellipsis handling

### Touch Interactions
- Minimum 44px touch targets for buttons
- Improved button spacing and sizing
- Better copy-to-clipboard feedback

### Table Responsiveness
- Horizontal scrolling for table view on mobile
- Expandable rows for detailed information
- Minimum column widths to prevent cramping
- Mobile-optimized action buttons

## Usage

```tsx
import { OrdersPage } from './page';

// The main page component handles all the orchestration
// Individual components can be used separately if needed

// Example: Using just the filters component
import { OrderFilters } from '@/components/dashboard/orders/order-filters';
import { useOrderFilters } from '@/hooks/use-order-filters';

function MyComponent() {
  const { filteredOrders, ...filterProps } = useOrderFilters(orders);
  
  return (
    <OrderFilters
      {...filterProps}
      totalResults={orders.length}
      filteredResults={filteredOrders.length}
      currentResults={currentOrders.length}
    />
  );
}
```

## Performance Considerations

- **Memoization**: Filter logic is memoized to prevent unnecessary recalculations
- **Pagination**: Only renders current page items to improve performance with large datasets
- **Real-time Updates**: Efficient Supabase subscriptions for live order updates
- **Lazy Loading**: Components are split for better code splitting

## Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Status badges meet WCAG contrast requirements
- **Touch Targets**: Minimum 44px touch targets for mobile users