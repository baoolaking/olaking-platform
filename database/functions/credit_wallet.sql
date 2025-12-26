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