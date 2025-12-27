-- Create a function to create pending wallet transaction records
-- This function runs with elevated privileges to bypass RLS

CREATE OR REPLACE FUNCTION create_pending_wallet_transaction(
  p_user_id UUID,
  p_amount NUMERIC,
  p_order_id UUID,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance NUMERIC;
  transaction_description TEXT;
BEGIN
  -- Get current wallet balance
  SELECT wallet_balance INTO current_balance
  FROM users
  WHERE id = p_user_id;
  
  -- Check if user exists
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Set default description if not provided
  IF p_description IS NULL THEN
    transaction_description := 'Wallet funding pending admin verification - Order ' || SUBSTRING(p_order_id::TEXT, 1, 8);
  ELSE
    transaction_description := p_description;
  END IF;
  
  -- Create pending transaction record
  INSERT INTO wallet_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description,
    order_id,
    reference,
    created_at
  ) VALUES (
    p_user_id,
    'credit',
    p_amount,
    current_balance,
    current_balance, -- Balance doesn't change until completion
    transaction_description,
    p_order_id,
    'pending_funding_' || p_order_id::TEXT,
    NOW()
  );
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail
    RAISE WARNING 'Failed to create pending wallet transaction: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION create_pending_wallet_transaction(UUID, NUMERIC, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_pending_wallet_transaction(UUID, NUMERIC, UUID, TEXT) TO service_role;

-- Test the function (replace with actual values)
-- SELECT create_pending_wallet_transaction(
--   'user-uuid-here'::UUID,
--   5000.00,
--   'order-uuid-here'::UUID,
--   'Test pending wallet funding'
-- );