# Wallet Integration Guide

This document explains the complete wallet functionality implementation for the BAO OLAKING platform.

## Overview

The wallet system allows users to:
- Fund their wallet via bank transfer
- Use wallet balance to purchase services
- View transaction history
- Receive refunds to their wallet

## Architecture

### Database Schema

The wallet system uses the following tables:
- `users` - Contains `wallet_balance` field
- `wallet_transactions` - Records all wallet transactions
- `orders` - Links to wallet transactions for payments
- `bank_accounts` - Admin-managed bank accounts for funding

### Key Components

1. **Wallet Page** (`/dashboard/wallet`)
   - View current balance
   - Fund wallet via bank transfer
   - View transaction history
   - Real-time payment status updates

2. **Services Page** (`/dashboard/services`)
   - Browse available services
   - Place orders with wallet or bank transfer
   - Real-time price calculation

3. **Orders Page** (`/dashboard/orders`)
   - View order history
   - Real-time order status updates
   - Payment instructions for bank transfers

## Wallet Funding Flow

### User Flow
1. User clicks "Fund Wallet" on wallet page
2. Enters amount (minimum enforced from admin settings)
3. Selects bank account from admin-configured list
4. Creates funding request (special order with `service_id = null`)
5. System shows payment instructions
6. User makes bank transfer externally
7. System polls for admin approval every minute
8. Admin verifies payment and approves order
9. Wallet is credited automatically via database function

### Technical Implementation
```typescript
// Create funding request
const { data: orderResult } = await supabase
  .from("orders")
  .insert({
    user_id: userData.id,
    service_id: null, // Special case for wallet funding
    quantity: 1,
    price_per_1k: amount,
    total_price: amount,
    status: "awaiting_payment",
    link: "wallet_funding",
    quality_type: "high_quality",
    payment_method: "bank_transfer",
    bank_account_id: selectedBankAccountId,
  });
```

## Service Purchase Flow

### Wallet Payment
1. User selects service and quantity
2. System calculates total price
3. Checks wallet balance sufficiency
4. If sufficient, creates order with status "pending"
5. Deducts amount from wallet via API route
6. Records transaction in `wallet_transactions`

### Bank Transfer Payment
1. User selects service and bank account
2. Creates order with status "awaiting_payment"
3. Shows payment instructions
4. Admin verifies and approves payment
5. Order status changes to "pending"

## Database Functions

### `deduct_from_wallet()`
```sql
CREATE OR REPLACE FUNCTION deduct_from_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_order_id UUID,
  p_description TEXT
) RETURNS BOOLEAN
```
- Atomically deducts amount from user's wallet
- Records transaction
- Returns false if insufficient balance

### `credit_wallet()`
```sql
CREATE OR REPLACE FUNCTION credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_order_id UUID DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS BOOLEAN
```
- Atomically credits amount to user's wallet
- Records transaction
- Used for funding and refunds

## API Routes

### `/api/wallet/deduct` (POST)
- Deducts amount from authenticated user's wallet
- Used for service purchases
- Requires: `amount`, `orderId`, `description`

### `/api/wallet/credit` (POST)
- Credits amount to specified user's wallet
- Admin-only endpoint
- Requires: `userId`, `amount`, `description`
- Optional: `orderId`

## Real-time Features

### Order Status Updates
- Uses Supabase real-time subscriptions
- Automatically updates UI when order status changes
- Polling fallback for payment confirmation

### Balance Updates
- Wallet balance updates immediately after transactions
- Transaction history refreshes automatically

## Validation & Security

### Client-side Validation
- Minimum/maximum funding amounts
- Service quantity limits
- URL validation for service links
- Payment method requirements

### Server-side Security
- Row Level Security (RLS) policies
- User can only access own wallet data
- Admin-only functions for wallet credit
- Atomic database transactions

## Admin Integration

### Wallet Management
- View all user wallet balances
- Credit/debit user wallets
- View transaction history
- Manage minimum funding amounts

### Payment Verification
- Manual payment verification workflow
- Order status management
- Refund processing

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Admin Settings
- `min_wallet_funding` - Minimum funding amount
- `whatsapp_contact_1` - Primary support contact
- `whatsapp_contact_2` - Secondary support contact

## Error Handling

### Common Scenarios
1. **Insufficient Balance**
   - Shows clear error message
   - Suggests wallet funding or bank transfer

2. **Payment Verification Timeout**
   - Continues polling for reasonable time
   - Provides support contact information

3. **Network Errors**
   - Retry mechanisms for API calls
   - Graceful degradation for real-time features

## Testing

### Test Scenarios
1. Fund wallet with minimum amount
2. Fund wallet with amount above maximum
3. Purchase service with sufficient wallet balance
4. Purchase service with insufficient balance
5. Bank transfer payment flow
6. Real-time order status updates
7. Transaction history display

### Test Data Setup
```sql
-- Create test bank account
INSERT INTO bank_accounts (account_name, account_number, bank_name, is_active)
VALUES ('Test Account', '1234567890', 'Test Bank', true);

-- Create test service
INSERT INTO services (platform, service_type, price_per_1k, is_active)
VALUES ('tiktok', 'followers', 1000, true);
```

## Troubleshooting

### Common Issues

1. **Wallet deduction fails**
   - Check user has sufficient balance
   - Verify database function exists
   - Check RLS policies

2. **Real-time updates not working**
   - Verify Supabase real-time is enabled
   - Check subscription setup
   - Fallback to manual refresh

3. **Payment polling stuck**
   - Check order status in database
   - Verify admin has access to approve payments
   - Clear polling state and retry

## Future Enhancements

1. **Automated Payment Verification**
   - Bank API integration
   - Webhook-based confirmations

2. **Wallet Limits**
   - Maximum wallet balance
   - Daily transaction limits

3. **Payment Methods**
   - Multiple payment gateways
   - Cryptocurrency support

4. **Notifications**
   - Email notifications for transactions
   - SMS alerts for payment confirmations

## Support

For issues with wallet functionality:
1. Check the troubleshooting section
2. Review database logs
3. Contact development team
4. Refer to Supabase documentation for database issues