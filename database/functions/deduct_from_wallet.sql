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