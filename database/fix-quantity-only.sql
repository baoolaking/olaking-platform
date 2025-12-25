-- FIX QUANTITY CONSTRAINT ONLY
-- Run this since the service_id constraint was already applied

-- Drop the existing quantity check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_quantity_check;

-- Add a new constraint that allows quantity = 1 for wallet funding, 100-500000 for services
ALTER TABLE orders ADD CONSTRAINT orders_quantity_check 
  CHECK (
    (link = 'wallet_funding' AND quantity = 1) OR 
    (link != 'wallet_funding' AND quantity >= 100 AND quantity <= 500000)
  );

-- Add comment to document the constraint
COMMENT ON CONSTRAINT orders_quantity_check ON orders IS 'Allows quantity = 1 for wallet funding, 100-500000 for service orders';

-- Verification query
SELECT 'Quantity constraint updated successfully!' as status;

-- Test the constraint (optional)
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'orders_quantity_check';