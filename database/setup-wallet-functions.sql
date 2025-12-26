-- Setup wallet functions for deducting and crediting wallet balance
-- Run this in Supabase SQL Editor

-- Function to safely deduct amount from user's wallet and create transaction record
-- Returns true if successful, false if insufficient balance
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
    -- Get current wallet balance with row lock
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
    
    -- Update user's wallet balance
    UPDATE users
    SET wallet_balance = new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
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
      -- Rollback will happen automatically
      RAISE EXCEPTION 'Failed to deduct from wallet: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely credit amount to user's wallet and create transaction record
-- Returns the new balance
CREATE OR REPLACE FUNCTION credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_order_id UUID DEFAULT NULL,
  p_reference TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  -- Start transaction
  BEGIN
    -- Get current wallet balance with row lock
    SELECT wallet_balance INTO current_balance
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;
    
    -- Check if user exists
    IF current_balance IS NULL THEN
      RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance + p_amount;
    
    -- Update user's wallet balance
    UPDATE users
    SET wallet_balance = new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Create wallet transaction record
    INSERT INTO wallet_transactions (
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      order_id,
      reference,
      created_by,
      created_at
    ) VALUES (
      p_user_id,
      'credit',
      p_amount,
      current_balance,
      new_balance,
      p_description,
      p_order_id,
      p_reference,
      p_created_by,
      NOW()
    );
    
    -- Return new balance
    RETURN new_balance;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE EXCEPTION 'Failed to credit wallet: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION deduct_from_wallet(UUID, NUMERIC, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION credit_wallet(UUID, NUMERIC, TEXT, UUID, TEXT, UUID) TO authenticated;

-- Verification
SELECT 'Wallet functions created successfully!' as status;

-- Test the functions exist
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_name IN ('deduct_from_wallet', 'credit_wallet')
  AND routine_schema = 'public';