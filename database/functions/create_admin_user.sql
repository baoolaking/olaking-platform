-- Function to create a user via admin with proper error handling
-- This bypasses potential trigger conflicts

CREATE OR REPLACE FUNCTION create_admin_user(
  p_auth_user_id UUID,
  p_email TEXT,
  p_username TEXT,
  p_whatsapp_no TEXT,
  p_full_name TEXT,
  p_role user_role DEFAULT 'user',
  p_is_active BOOLEAN DEFAULT true,
  p_bank_account_name TEXT DEFAULT NULL,
  p_bank_account_number TEXT DEFAULT NULL,
  p_bank_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user record
  INSERT INTO users (
    id,
    email,
    username,
    whatsapp_no,
    full_name,
    role,
    is_active,
    bank_account_name,
    bank_account_number,
    bank_name,
    wallet_balance,
    created_at,
    updated_at
  ) VALUES (
    p_auth_user_id,
    p_email,
    p_username,
    p_whatsapp_no,
    p_full_name,
    p_role,
    p_is_active,
    p_bank_account_name,
    p_bank_account_number,
    p_bank_name,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    whatsapp_no = EXCLUDED.whatsapp_no,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    bank_account_name = EXCLUDED.bank_account_name,
    bank_account_number = EXCLUDED.bank_account_number,
    bank_name = EXCLUDED.bank_name,
    updated_at = NOW();

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle unique constraint violations
    IF SQLERRM LIKE '%username%' THEN
      RAISE EXCEPTION 'Username is already taken';
    ELSIF SQLERRM LIKE '%whatsapp%' THEN
      RAISE EXCEPTION 'WhatsApp number is already registered';
    ELSIF SQLERRM LIKE '%email%' THEN
      RAISE EXCEPTION 'Email is already registered';
    ELSE
      RAISE EXCEPTION 'A user with this information already exists';
    END IF;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_admin_user(UUID, TEXT, TEXT, TEXT, TEXT, user_role, BOOLEAN, TEXT, TEXT, TEXT) TO authenticated;