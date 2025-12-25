# Database Migration Guide

This guide explains how to apply the necessary database migrations for the wallet functionality.

## Migration 002: Allow NULL service_id and Fix Quantity Constraint for Wallet Funding

### Problem
The current database schema has two issues preventing wallet funding:

1. **service_id constraint**: Requires `service_id` to be NOT NULL, but wallet funding orders don't have an associated service
2. **quantity constraint**: Requires quantity to be between 100-500,000, but wallet funding logically uses quantity = 1

### Solution
We need to modify the orders table to:
1. Allow `service_id` to be NULL for wallet funding orders
2. Allow `quantity = 1` for wallet funding orders while maintaining the 100-500,000 range for service orders

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the following SQL migration:

```sql
-- COMPLETE WALLET FUNDING FIX
-- This fixes both service_id and quantity constraints for wallet funding

-- Fix service_id constraint (allow NULL for wallet funding)
ALTER TABLE orders ALTER COLUMN service_id DROP NOT NULL;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_service_id_fkey 
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT;

ALTER TABLE orders ADD CONSTRAINT orders_service_or_wallet_funding_check 
  CHECK (
    (service_id IS NOT NULL AND link != 'wallet_funding') OR 
    (service_id IS NULL AND link = 'wallet_funding')
  );

-- Fix quantity constraint (allow quantity = 1 for wallet funding)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_quantity_check;

ALTER TABLE orders ADD CONSTRAINT orders_quantity_check 
  CHECK (
    (link = 'wallet_funding' AND quantity = 1) OR 
    (link != 'wallet_funding' AND quantity >= 100 AND quantity <= 500000)
  );

-- Add documentation comments
COMMENT ON COLUMN orders.service_id IS 'Service ID - NULL for wallet funding orders, required for service orders';
COMMENT ON CONSTRAINT orders_service_or_wallet_funding_check ON orders IS 'Ensures service_id is provided for service orders and NULL for wallet funding';
COMMENT ON CONSTRAINT orders_quantity_check ON orders IS 'Allows quantity = 1 for wallet funding, 100-500000 for service orders';
```

4. Click "Run" to execute the migration

### Option 2: Using Supabase CLI

If you're using the Supabase CLI for local development:

1. Create a new migration file:
```bash
supabase migration new allow_null_service_id
```

2. Copy the SQL content from `database/migrations/002_allow_null_service_id.sql` into the generated migration file

3. Apply the migration:
```bash
supabase db push
```

## Verification

After applying the migration, verify it worked correctly:

### 1. Check the Table Structure
```sql
-- Verify service_id is now nullable
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'service_id';
```

Expected result: `is_nullable` should be `YES`

### 2. Check Constraints
```sql
-- Verify the check constraint exists
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'orders_service_or_wallet_funding_check';
```

### 3. Test Wallet Funding Order Creation
```sql
-- Test creating a wallet funding order (should succeed)
INSERT INTO orders (
  user_id, 
  service_id, 
  quantity, 
  price_per_1k, 
  total_price, 
  status, 
  link, 
  quality_type, 
  payment_method
) VALUES (
  'your-user-id-here',
  NULL, -- This should now work
  1,
  1000,
  1000,
  'awaiting_payment',
  'wallet_funding',
  'high_quality',
  'bank_transfer'
);
```

### 4. Test Service Order Creation
```sql
-- Test creating a regular service order (should still work)
INSERT INTO orders (
  user_id, 
  service_id, 
  quantity, 
  price_per_1k, 
  total_price, 
  status, 
  link, 
  quality_type, 
  payment_method
) VALUES (
  'your-user-id-here',
  'your-service-id-here', -- This should be required for non-wallet orders
  1000,
  2,
  2000,
  'awaiting_payment',
  'https://tiktok.com/@example',
  'high_quality',
  'wallet'
);
```

## What This Migration Does

### 1. **Removes NOT NULL Constraint**
- Allows `service_id` to be NULL in the orders table
- Maintains foreign key relationship when `service_id` is provided

### 2. **Adds Data Integrity Check**
- Ensures `service_id` is NOT NULL for regular service orders
- Ensures `service_id` IS NULL for wallet funding orders (identified by `link = 'wallet_funding'`)
- Prevents invalid combinations

### 3. **Maintains Backward Compatibility**
- Existing service orders continue to work unchanged
- All existing constraints remain intact
- No data loss or corruption

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- WARNING: This will fail if you have wallet funding orders with NULL service_id
-- You'll need to delete those orders first

-- Remove the check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_service_or_wallet_funding_check;

-- Add back the NOT NULL constraint
ALTER TABLE orders ALTER COLUMN service_id SET NOT NULL;

-- Remove comments
COMMENT ON COLUMN orders.service_id IS NULL;
COMMENT ON CONSTRAINT orders_service_or_wallet_funding_check ON orders IS NULL;
```

## Impact on Application

After this migration:

### ✅ **Wallet Funding Will Work**
- Users can create wallet funding requests
- Orders with `service_id = NULL` and `link = 'wallet_funding'` are allowed

### ✅ **Service Orders Continue Working**
- Regular service orders still require `service_id`
- All existing functionality remains unchanged

### ✅ **Data Integrity Maintained**
- Check constraint prevents invalid combinations
- Foreign key relationships preserved
- No orphaned or invalid data possible

## Troubleshooting

### Migration Fails with "constraint violation"
If you have existing orders with invalid data, clean them up first:

```sql
-- Check for problematic orders
SELECT * FROM orders WHERE 
  (service_id IS NULL AND link != 'wallet_funding') OR
  (service_id IS NOT NULL AND link = 'wallet_funding');

-- Delete or fix problematic orders before running migration
```

### Application Still Shows Error
1. Verify the migration was applied successfully
2. Check that your application code is using the correct SQL
3. Restart your application to clear any cached connections
4. Check Supabase logs for detailed error messages

## Next Steps

After applying this migration:

1. ✅ Test wallet funding functionality in your application
2. ✅ Verify service orders still work correctly  
3. ✅ Monitor application logs for any issues
4. ✅ Update your team about the database schema change

For any issues, check the Supabase dashboard logs or contact your development team.