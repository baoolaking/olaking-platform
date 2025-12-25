-- Migration: Add awaiting_confirmation status to order_status enum
-- This allows users to mark that they've sent payment and notify admin

-- Add the new enum value
ALTER TYPE order_status ADD VALUE 'awaiting_confirmation';

-- Add comment to document the new status
COMMENT ON TYPE order_status IS 'Order status enum - awaiting_confirmation indicates user has sent payment and admin needs to verify';