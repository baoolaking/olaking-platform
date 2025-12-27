-- Add custom order number column to orders table
-- This will create user-friendly order numbers like ORD-001, ORD-002, etc.

-- Add the column
ALTER TABLE orders ADD COLUMN order_number VARCHAR(20) UNIQUE;

-- Create a sequence for generating order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create a function to generate custom order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    order_num TEXT;
BEGIN
    -- Get the next sequence value
    SELECT nextval('order_number_seq') INTO next_num;
    
    -- Format as ORD-XXX with zero padding
    order_num := 'ORD-' || LPAD(next_num::TEXT, 3, '0');
    
    -- Check if this number already exists (safety check)
    WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = order_num) LOOP
        SELECT nextval('order_number_seq') INTO next_num;
        order_num := 'ORD-' || LPAD(next_num::TEXT, 3, '0');
    END LOOP;
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set order_number if it's not already provided
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Update existing orders to have order numbers
-- This will assign order numbers to existing orders based on their creation order
DO $$
DECLARE
    order_record RECORD;
    counter INTEGER := 1;
BEGIN
    -- Update existing orders in creation order
    FOR order_record IN 
        SELECT id FROM orders 
        WHERE order_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        UPDATE orders 
        SET order_number = 'ORD-' || LPAD(counter::TEXT, 3, '0')
        WHERE id = order_record.id;
        
        counter := counter + 1;
    END LOOP;
    
    -- Update the sequence to continue from where we left off
    PERFORM setval('order_number_seq', counter);
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Add comment
COMMENT ON COLUMN orders.order_number IS 'User-friendly order number in format ORD-XXX';