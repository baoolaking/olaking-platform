# Order Assignment Feature

## Overview
The order assignment feature allows admins to claim orders and prevent conflicts when multiple admins are working on the same orders. It includes comprehensive filtering to help admins manage their workload effectively.

## Database Changes
- Added `assigned_to` column (UUID, FK to users table)
- Added `assigned_at` timestamp column
- Added indexes for performance
- Updated TypeScript types to include assignment fields

## Features

### Assignment Actions
- **Assign to Me**: Admins can claim unassigned orders
- **Unassign Order**: Admins can release orders they've assigned to themselves
- **Visual Indicators**: Clear visual feedback showing assignment status

### Filtering System
- **Assignment Filter**: Filter orders by assignment status
  - All Orders: Show all orders (default)
  - Assigned to Me: Show only orders assigned to current admin
  - Assigned to Others: Show orders assigned to other admins
  - Unassigned: Show only unassigned orders
- **Combined Filters**: Assignment filter works with existing status, payment, date, and search filters

### UI Components
- **Assigned To Column**: Shows who is handling each order
- **Assignment Actions**: Available in the actions dropdown menu
- **Mobile Support**: Assignment status visible in mobile accordion view
- **Color Coding**: 
  - Green: Assigned to current user
  - Orange: Assigned to another admin
  - Gray: Unassigned

### Permissions
- Only admins (super_admin or sub_admin) can assign/unassign orders
- Admins can only unassign orders they've assigned to themselves
- Assignment information is visible to all admins

## Usage

### For Admins
1. **Claiming an Order**: Click the actions menu (⋯) and select "Assign to Me"
2. **Releasing an Order**: Click the actions menu and select "Unassign Order" 
3. **Viewing Assignment**: Check the "Assigned To" column or mobile view indicators
4. **Filtering by Assignment**: Use the Assignment filter dropdown to focus on specific order types

### Visual Indicators
- **Unassigned Orders**: Show "Unassigned" in gray text
- **Your Orders**: Show "You" in green with checkmark icon
- **Other Admin's Orders**: Show admin name in orange with checkmark icon

## Technical Implementation

### Database Schema
```sql
ALTER TABLE orders ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN assigned_at TIMESTAMPTZ;
```

### API Functions
- `assignOrder(orderId: string)`: Assigns order to current admin
- `unassignOrder(orderId: string)`: Removes assignment from order

### Components Updated
- `OrdersTable`: Added assignment column and actions
- `useAdminOrders`: Added assignment functions
- `useAdminOrderFilters`: Added assignment filtering logic
- `AdminOrderFilters`: Added assignment filter dropdown
- `AdminOrdersPage`: Integrated assignment functionality

## Benefits
- **Prevents Conflicts**: Multiple admins won't work on the same order
- **Clear Ownership**: Easy to see who is handling what
- **Improved Workflow**: Better coordination between admin team members
- **Efficient Filtering**: Quickly find orders by assignment status
- **Audit Trail**: Assignment timestamps for tracking