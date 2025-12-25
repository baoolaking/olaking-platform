-- Migration: Allow NULL service_id for wallet funding orders
-- This allows orders to be created without a service_id for wallet funding purposes

-- Remove the NOT NULL constraint from service_id
ALTER TABLE orders ALTER COLUMN service_id DROP NOT NULL;

-- Update the foreign key constraint to allow NULL values
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_service_id_fkey 
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT;

-- Add a check constraint to ensure either service_id is provided OR it's a wallet funding order
ALTER TABLE orders ADD CONSTRAINT orders_service_or_wallet_funding_check 
  CHECK (
    (service_id IS NOT NULL AND link != 'wallet_funding') OR 
    (service_id IS NULL AND link = 'wallet_funding')
  );

-- Add comment to document the change
COMMENT ON COLUMN orders.service_id IS 'Service ID - NULL for wallet funding orders, required for service orders';
COMMENT ON CONSTRAINT orders_service_or_wallet_funding_check ON orders IS 'Ensures service_id is provided for service orders and NULL for wallet funding';