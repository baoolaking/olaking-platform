-- Check foreign key relationships for orders table
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'orders';

-- Check if users table exists and has the expected columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if orders table has user_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'user_id';

-- Sample data check - see if we have orders and users
SELECT 
    'orders' as table_name,
    COUNT(*) as count
FROM orders
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as count
FROM users;

-- Check if there are orders with valid user_ids
SELECT 
    o.id as order_id,
    o.user_id,
    u.id as user_exists,
    u.username,
    u.full_name
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LIMIT 10;