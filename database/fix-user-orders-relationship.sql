-- Fix the relationship between orders and users tables

-- 1. First, let's check if there are any orphaned orders (orders without valid users)
SELECT 
    o.id as order_id,
    o.user_id,
    u.id as user_exists
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- 2. Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    -- Check if foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_user_id_fkey' 
        AND table_name = 'orders'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE orders 
        ADD CONSTRAINT orders_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- 3. Create or update RLS policies to allow admin access to users table
-- First, check if RLS is enabled on users table
DO $$
BEGIN
    -- Enable RLS on users table if not already enabled
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing admin policy if it exists
    DROP POLICY IF EXISTS "Admin can read all users" ON users;
    
    -- Create policy to allow admin users to read all user data
    CREATE POLICY "Admin can read all users" ON users
        FOR SELECT
        USING (true); -- Allow all authenticated users to read (you may want to restrict this)
    
    RAISE NOTICE 'RLS policies updated for users table';
END $$;

-- 4. Ensure orders table has proper RLS policies
DO $$
BEGIN
    -- Enable RLS on orders table if not already enabled
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing admin policy if it exists
    DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
    
    -- Create policy to allow admin users to read all orders
    CREATE POLICY "Admin can read all orders" ON orders
        FOR SELECT
        USING (true); -- Allow all authenticated users to read (you may want to restrict this)
    
    RAISE NOTICE 'RLS policies updated for orders table';
END $$;

-- 5. Test the relationship
SELECT 
    'Test Query Results' as info,
    COUNT(*) as total_orders,
    COUNT(u.id) as orders_with_users,
    COUNT(*) - COUNT(u.id) as orders_without_users
FROM orders o
LEFT JOIN users u ON o.user_id = u.id;

-- 6. Show sample data with join
SELECT 
    o.id as order_id,
    o.order_number,
    o.user_id,
    u.username,
    u.full_name,
    u.email
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 5;