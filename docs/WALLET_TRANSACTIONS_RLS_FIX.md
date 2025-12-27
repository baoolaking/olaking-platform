# Wallet Transactions RLS Policy Fix

## Problem
Transaction records were not being created for wallet funding orders because Row Level Security (RLS) policies were silently blocking the insert operations.

## Root Cause Analysis
1. **RLS Enabled**: The `wallet_transactions` table likely has RLS enabled
2. **Missing Policies**: No RLS policies existed to allow authenticated users to create transaction records
3. **Silent Failures**: RLS violations don't throw errors, they just silently prevent operations
4. **User Context**: Auto-update route runs in user context, not admin context

## Solution Implemented

### 1. Database Function Approach
Created a secure database function `create_pending_wallet_transaction()` that:
- Runs with `SECURITY DEFINER` (elevated privileges)
- Bypasses RLS policies safely
- Handles all transaction creation logic
- Includes proper error handling and logging

### 2. RLS Policy Setup
Created comprehensive RLS policies for `wallet_transactions` table:
- **Users can view own transactions**: `FOR SELECT USING (auth.uid() = user_id)`
- **Service role full access**: `FOR ALL TO service_role USING (true)`
- **Users can create own transactions**: `FOR INSERT WITH CHECK (auth.uid() = user_id)`
- **Admins can view all**: Admin role check for SELECT
- **Admins can create/update**: Admin role check for INSERT/UPDATE

### 3. Auto-Update Route Enhancement
Modified the auto-update route to:
- Use the new database function instead of direct table insert
- Maintain proper error handling without failing the main operation
- Log success/failure for debugging

## Files Created/Modified

### Database Files
- `database/check-wallet-transactions-rls.sql` - Diagnostic queries
- `database/setup-wallet-transactions-rls.sql` - RLS policy setup
- `database/create-pending-wallet-transaction-function.sql` - Secure function

### Application Files
- `app/api/orders/[orderId]/auto-update/route.ts` - Uses new function
- `types/database.ts` - Added function type definition

## Setup Instructions

### Step 1: Check Current RLS Status
```sql
-- Run in Supabase SQL Editor
\i database/check-wallet-transactions-rls.sql
```

### Step 2: Setup RLS Policies
```sql
-- Run in Supabase SQL Editor
\i database/setup-wallet-transactions-rls.sql
```

### Step 3: Create Database Function
```sql
-- Run in Supabase SQL Editor
\i database/create-pending-wallet-transaction-function.sql
```

## How It Works Now

### Transaction Creation Flow
1. **User confirms payment** → countdown starts
2. **Countdown expires** → auto-update route called
3. **Order status updated** to "pending"
4. **Database function called** with user_id, amount, order_id
5. **Function runs with elevated privileges** → bypasses RLS
6. **Transaction record created** with pending status
7. **User sees transaction** in wallet history immediately

### Security Benefits
- **Controlled Access**: Function only allows creating transactions for valid orders
- **Audit Trail**: All transactions properly linked to orders
- **User Isolation**: Users can only see their own transactions
- **Admin Oversight**: Admins can view/manage all transactions
- **Service Role Access**: Server operations work without RLS issues

## Testing Checklist

### Before Running SQL Scripts
- [ ] Backup database (if production)
- [ ] Test in development environment first
- [ ] Verify current RLS status

### After Running SQL Scripts
- [ ] Verify RLS policies created correctly
- [ ] Test function execution permissions
- [ ] Create test wallet funding order
- [ ] Verify transaction appears in wallet history
- [ ] Test admin completion flow
- [ ] Check error handling scenarios

### Debugging Commands
```sql
-- Check if function exists
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_name = 'create_pending_wallet_transaction';

-- Test function manually
SELECT create_pending_wallet_transaction(
  'user-uuid'::UUID,
  1000.00,
  'order-uuid'::UUID,
  'Test transaction'
);

-- Check recent transactions
SELECT * FROM wallet_transactions 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Rollback Plan
If issues occur, you can:
1. Drop the new function: `DROP FUNCTION create_pending_wallet_transaction;`
2. Disable RLS temporarily: `ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;`
3. Revert code changes to use admin client approach
4. Re-enable RLS after fixing policies