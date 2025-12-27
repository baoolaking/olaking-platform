-- Check RLS status and policies for wallet_transactions table

-- Check if RLS is enabled on wallet_transactions table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'wallet_transactions';

-- Check existing RLS policies on wallet_transactions table
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
WHERE tablename = 'wallet_transactions';

-- Check if wallet_transactions table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'wallet_transactions'
ORDER BY ordinal_position;