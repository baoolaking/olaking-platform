-- Setup RLS policies for wallet_transactions table
-- Run this in Supabase SQL Editor

-- Enable RLS on wallet_transactions table if not already enabled
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Service role can manage all transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Authenticated users can create own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admins can create transactions" ON wallet_transactions;

-- Policy 1: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON wallet_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Service role can do everything (for server-side operations)
CREATE POLICY "Service role can manage all transactions" ON wallet_transactions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 3: Authenticated users can create transactions for themselves
-- This allows the auto-update route to create pending transactions
CREATE POLICY "Authenticated users can create own transactions" ON wallet_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admin users can view all transactions
CREATE POLICY "Admins can view all transactions" ON wallet_transactions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'sub_admin')
        )
    );

-- Policy 5: Admin users can create transactions (for manual wallet management)
CREATE POLICY "Admins can create transactions" ON wallet_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'sub_admin')
        )
    );

-- Policy 6: Admin users can update transactions (for updating descriptions, etc.)
CREATE POLICY "Admins can update transactions" ON wallet_transactions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'sub_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'sub_admin')
        )
    );

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'wallet_transactions'
ORDER BY policyname;