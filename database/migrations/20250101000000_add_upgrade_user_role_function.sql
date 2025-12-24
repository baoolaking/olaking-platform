-- Create a SECURITY DEFINER function to upgrade user role
-- This bypasses RLS and the protect_user_protected_fields trigger

CREATE OR REPLACE FUNCTION upgrade_user_role(
  p_email TEXT,
  p_new_role user_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_count INTEGER;
BEGIN
  -- Update the user role
  UPDATE users
  SET role = p_new_role
  WHERE email = p_email;
  
  -- Check if update was successful
  GET DIAGNOSTICS v_user_count = ROW_COUNT;
  
  IF v_user_count > 0 THEN
    RETURN TRUE;
  ELSE
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upgrade_user_role(TEXT, user_role) TO authenticated;
