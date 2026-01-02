-- Function to safely process a refund for a failed order
-- Creates a wallet transaction with 'refund' type and updates user balance
-- Returns the new balance

CREATE OR REPLACE FUNCTION process_refund(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_order_id UUID,
  p_reference TEXT,
  p_created_by UUID
) RETURNS NUMERIC AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  existing_refund_count INTEGER;
BEGIN
  -- Start transaction
  BEGIN
    -- Check for duplicate refund first
    SELECT COUNT(*) INTO existing_refund_count
    FROM wallet_transactions
    WHERE order_id = p_order_id 
      AND transaction_type = 'refund';
    
    IF existing_refund_count > 0 THEN
      RAISE EXCEPTION 'Order has already been refunded';
    END IF;
    
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
    
    -- Create wallet transaction record with 'refund' type
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
      'refund',
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
      RAISE EXCEPTION 'Failed to process refund: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;