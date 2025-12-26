-- Fix quantity constraint to allow dynamic min/max based on services table
-- This removes the hardcoded 100-500000 limit and allows any positive quantity for service orders

-- Step 1: Drop the existing quantity check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_quantity_check;

-- Step 2: Add a new constraint that allows quantity = 1 for wallet funding, any positive quantity for services
-- The actual min/max validation will be handled by the application layer based on the services table
ALTER TABLE orders ADD CONSTRAINT orders_quantity_check 
  CHECK (
    (link = 'wallet_funding' AND quantity = 1) OR 
    (link != 'wallet_funding' AND quantity > 0 AND quantity <= 10000000)
  );

-- Add comment to document the constraint
COMMENT ON CONSTRAINT orders_quantity_check ON orders IS 'Allows quantity = 1 for wallet funding, 1-10M for service orders (actual limits enforced by app based on services table)';

-- Verification query
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'orders_quantity_check';

-- Show current constraint
SELECT 'Database constraint updated to allow dynamic quantities!' as status;