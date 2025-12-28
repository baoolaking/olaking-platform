-- Migration: Add order assignment functionality
-- This allows admins to assign orders to themselves to prevent conflicts

-- Add assigned_to column to track which admin is handling the order
ALTER TABLE orders ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add assigned_at timestamp to track when the order was assigned
ALTER TABLE orders ADD COLUMN assigned_at TIMESTAMPTZ;

-- Add index for performance on assigned orders
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX idx_orders_assigned_at ON orders(assigned_at DESC);

-- Add comments to document the new columns
COMMENT ON COLUMN orders.assigned_to IS 'Admin user ID who is assigned to handle this order - prevents conflicts between admins';
COMMENT ON COLUMN orders.assigned_at IS 'Timestamp when the order was assigned to an admin';

-- Add constraint to ensure only admins can be assigned to orders
-- This will be enforced at the application level since we can't easily check roles in a constraint