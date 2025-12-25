-- QUICK FIX: Allow NULL service_id for wallet funding orders
-- Run this in your Supabase SQL Editor to fix the wallet funding issue immediately

-- Step 1: Remove the NOT NULL constraint from service_id
ALTER TABLE orders ALTER COLUMN service_id DROP NOT NULL;

-- Step 2: Update the foreign key constraint to allow NULL values
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_service_id_fkey 
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT;

-- Step 3: Add a check constraint for data integrity
ALTER TABLE orders ADD CONSTRAINT orders_service_or_wallet_funding_check 
  CHECK (
    (service_id IS NOT NULL AND link != 'wallet_funding') OR 
    (service_id IS NULL AND link = 'wallet_funding')
  );

-- Step 4: Add documentation comments
COMMENT ON COLUMN orders.service_id IS 'Service ID - NULL for wallet funding orders, required for service orders';

-- Verification query - run this to confirm the fix worked
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'service_id';

-- Expected result: is_nullable should be 'YES'