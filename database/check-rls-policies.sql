-- Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Check RLS policies on orders table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- Check if RLS is enabled on these tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'orders');

-- Test if we can query users table directly
SELECT COUNT(*) as user_count FROM users;

-- Test if we can query orders table directly  
SELECT COUNT(*) as order_count FROM orders;

-- Test join between orders and users
SELECT 
    COUNT(*) as total_orders,
    COUNT(u.id) as orders_with_users,
    COUNT(*) - COUNT(u.id) as orders_without_users
FROM orders o
LEFT JOIN users u ON o.user_id = u.id;