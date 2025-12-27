-- Create a secure function to get admin emails
-- This function uses SECURITY DEFINER to run with elevated privileges

CREATE OR REPLACE FUNCTION get_active_admin_emails()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_emails TEXT[];
BEGIN
    -- Get all active admin emails
    SELECT ARRAY_AGG(email)
    INTO admin_emails
    FROM users
    WHERE role IN ('sub_admin', 'super_admin')
      AND is_active = true
      AND email IS NOT NULL;
    
    -- Return empty array if no admins found
    IF admin_emails IS NULL THEN
        admin_emails := ARRAY[]::TEXT[];
    END IF;
    
    RETURN admin_emails;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_active_admin_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_admin_emails() TO service_role;

-- Test the function
SELECT get_active_admin_emails() as admin_emails;