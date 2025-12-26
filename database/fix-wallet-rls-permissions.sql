-- Fix wallet deduction by ensuring proper RLS policies and function permissions
-- Run this in Supabase SQL Editor

-- First, let's check current RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Create or replace the deduct_from_wallet function with proper security
CREATE OR REPLACE FUNCTION deduct_from_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_order_id UUID,
  p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  -- Start transaction
  BEGIN
    -- Get current wallet balance with row lock (bypass RLS with security definer)
    SELECT wallet_balance INTO current_balance
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;
    
    -- Check if user exists
    IF current_balance IS NULL THEN
      RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Check if sufficient balance
    IF current_balance < p_amount THEN
      RETURN FALSE;
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance - p_amount;
    
    -- Update user's wallet balance (this should work with SECURITY DEFINER)
    UPDATE users
    SET wallet_balance = new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Verify the update worked
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Failed to update user wallet balance';
    END IF;
    
    -- Create wallet transaction record
    INSERT INTO wallet_transactions (
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      order_id,
      created_at
    ) VALUES (
      p_user_id,
      'debit',
      p_amount,
      current_balance,
      new_balance,
      p_description,
      p_order_id,
      NOW()
    );
    
    -- Return success
    RETURN TRUE;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error for debugging
      RAISE EXCEPTION 'Failed to deduct from wallet: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION deduct_from_wallet(UUID, NUMERIC, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_from_wallet(UUID, NUMERIC, UUID, TEXT) TO service_role;

-- Create a policy that allows the service role to update wallet_balance if it doesn't exist
DO $$
BEGIN
  -- Try to create a policy for wallet updates by service role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Allow service role wallet updates'
  ) THEN
    CREATE POLICY "Allow service role wallet updates" ON users
      FOR UPDATE 
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Alternative: Create a simpler function that uses service role privileges
CREATE OR REPLACE FUNCTION deduct_from_wallet_simple(
  p_user_id UUID,
  p_amount NUMERIC,
  p_order_id UUID,
  p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  update_count INTEGER;
BEGIN
  -- Get current balance
  SELECT wallet_balance INTO current_balance
  FROM users
  WHERE id = p_user_id;
  
  -- Check if user exists and has sufficient balance
  IF current_balance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - p_amount;
  
  -- Use a direct SQL update that should bypass RLS
  EXECUTE format('UPDATE users SET wallet_balance = %s, updated_at = NOW() WHERE id = %L', 
                 new_balance, p_user_id);
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Create transaction record
  INSERT INTO wallet_transactions (
    user_id, transaction_type, amount, balance_before, balance_after, 
    description, order_id, created_at
  ) VALUES (
    p_user_id, 'debit', p_amount, current_balance, new_balance, 
    p_description, p_order_id, NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the simple function
GRANT EXECUTE ON FUNCTION deduct_from_wallet_simple(UUID, NUMERIC, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_from_wallet_simple(UUID, NUMERIC, UUID, TEXT) TO service_role;

-- Test query to verify functions exist
SELECT 'Wallet functions updated with RLS bypass!' as status;

SELECT routine_name, security_type
FROM information_schema.routines 
WHERE routine_name LIKE '%deduct_from_wallet%'
  AND routine_schema = 'public';