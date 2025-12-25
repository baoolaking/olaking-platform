-- COMPLETE WALLET FUNDING FIX
-- Run this in your Supabase SQL Editor to fix all wallet funding issues

-- ============================================================================
-- STEP 1: Fix service_id constraint (allow NULL for wallet funding)
-- ============================================================================

-- Remove the NOT NULL constraint from service_id (if not already done)
DO $$ 
BEGIN
    -- Check if service_id is still NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'service_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE orders ALTER COLUMN service_id DROP NOT NULL;
    END IF;
END $$;

-- Update the foreign key constraint to allow NULL values (if not already done)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_service_id_fkey 
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT;

-- Add a check constraint for data integrity (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'orders_service_or_wallet_funding_check'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_service_or_wallet_funding_check 
          CHECK (
            (service_id IS NOT NULL AND link != 'wallet_funding') OR 
            (service_id IS NULL AND link = 'wallet_funding')
          );
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Fix quantity constraint (allow quantity = 1 for wallet funding)
-- ============================================================================

-- Drop the existing quantity check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_quantity_check;

-- Add a new constraint that allows quantity = 1 for wallet funding, 100-500000 for services
ALTER TABLE orders ADD CONSTRAINT orders_quantity_check 
  CHECK (
    (link = 'wallet_funding' AND quantity = 1) OR 
    (link != 'wallet_funding' AND quantity >= 100 AND quantity <= 500000)
  );

-- ============================================================================
-- STEP 3: Add documentation comments
-- ============================================================================

COMMENT ON COLUMN orders.service_id IS 'Service ID - NULL for wallet funding orders, required for service orders';
COMMENT ON CONSTRAINT orders_service_or_wallet_funding_check ON orders IS 'Ensures service_id is provided for service orders and NULL for wallet funding';
COMMENT ON CONSTRAINT orders_quantity_check ON orders IS 'Allows quantity = 1 for wallet funding, 100-500000 for service orders';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify service_id is now nullable
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'service_id';
-- Expected: is_nullable = 'YES'

-- Verify constraints exist
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name IN ('orders_service_or_wallet_funding_check', 'orders_quantity_check');
-- Expected: Both constraints should be listed

-- ============================================================================
-- TEST WALLET FUNDING ORDER (Optional - replace with real user_id and bank_account_id)
-- ============================================================================

/*
-- Uncomment and update with real IDs to test
INSERT INTO orders (
  user_id, 
  service_id, 
  quantity, 
  price_per_1k, 
  total_price, 
  status, 
  link, 
  quality_type, 
  payment_method,
  bank_account_id
) VALUES (
  'your-user-id-here',     -- Replace with real user ID
  NULL,                    -- NULL for wallet funding
  1,                       -- quantity = 1 for wallet funding
  1000,                    -- funding amount
  1000,                    -- total price
  'awaiting_payment',
  'wallet_funding',
  'high_quality',
  'bank_transfer',
  'your-bank-account-id-here'  -- Replace with real bank account ID
);
*/

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'Wallet funding database fix completed successfully!' as status;