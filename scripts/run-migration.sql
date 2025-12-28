-- Run this migration to add order assignment functionality
-- Execute this in your Supabase SQL editor or database client

-- Migration: Add order assignment functionality
-- This allows admins to assign orders to themselves to prevent conflicts

-- Add assigned_to column to track which admin is handling the order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add assigned_at timestamp to track when the order was assigned
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Add indexes for performance on assigned orders
CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_at ON orders(assigned_at DESC);

-- Add comments to document the new columns
COMMENT ON COLUMN orders.assigned_to IS 'Admin user ID who is assigned to handle this order - prevents conflicts between admins';
COMMENT ON COLUMN orders.assigned_at IS 'Timestamp when the order was assigned to an admin';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('assigned_to', 'assigned_at')
ORDER BY column_name;