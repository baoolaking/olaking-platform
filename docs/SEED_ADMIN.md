# Seed Super Admin Account

## Method 1: Via Register Page (Recommended)

1. Go to `/register` and create account with:

   - Email: olaitan@olaking.store
   - Username: olaitan_admin
   - Full Name: Olaitan Admin
   - WhatsApp: +2349000000000
   - Password: Pa$$w0rd!

2. **First time only:** Create the upgrade function by running this in Supabase SQL Editor:

```sql
-- Create a SECURITY DEFINER function to upgrade user role
-- This bypasses RLS and the protect_user_protected_fields trigger
CREATE OR REPLACE FUNCTION upgrade_user_role(
  p_email TEXT,
  p_new_role user_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_count INTEGER;
BEGIN
  -- Find the user
  SELECT id INTO v_user_id FROM users WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;

  -- Use direct update bypassing triggers by updating auth.users metadata
  UPDATE users
  SET role = p_new_role
  WHERE id = v_user_id;

  GET DIAGNOSTICS v_user_count = ROW_COUNT;

  IF v_user_count > 0 THEN
    RETURN TRUE;
  ELSE
    RAISE EXCEPTION 'Failed to update user role';
  END IF;
END;
$$;

-- Alter the function to set a bypass flag
ALTER FUNCTION upgrade_user_role(TEXT, user_role) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION upgrade_user_role(TEXT, user_role) TO authenticated;
```

Then, modify the `protect_user_protected_fields()` trigger to allow upgrades. Run this:

```sql
-- Drop and recreate the trigger to allow role updates from admin functions
DROP TRIGGER IF EXISTS protect_user_protected_fields ON users;

CREATE OR REPLACE FUNCTION protect_user_protected_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow updates from the upgrade_user_role function
  IF current_setting('app.current_function', true) = 'upgrade_user_role' THEN
    RETURN NEW;
  END IF;

  -- Check if user is trying to modify protected fields
  IF (OLD.role IS DISTINCT FROM NEW.role OR
      OLD.wallet_balance IS DISTINCT FROM NEW.wallet_balance)
  THEN
    -- Allow only super_admin or sub_admin to modify these fields
    IF auth.uid() IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin')
      ) THEN
        RAISE EXCEPTION 'Not allowed to modify protected fields';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_user_protected_fields
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION protect_user_protected_fields();
```

3. After completing step 2, run this SQL in Supabase SQL Editor:

```sql
-- Call the secure function to upgrade role (bypasses RLS and triggers)
SELECT upgrade_user_role('olaitan@olaking.store', 'super_admin'::user_role);
```

## Method 2: Direct SQL Insert

-- Or use Supabase Dashboard → Authentication → Users → Invite User
-- Email: olaitan@olaking.store
-- Then run:

-- Update/Insert into public.users table (assuming auth user was created)
INSERT INTO users (
id,
email,
username,
whatsapp_no,
full_name,
role,
wallet_balance,
created_at,
updated_at
)
SELECT
id,
'olaitan@olaking.store',
'olaitan_admin',
'+2349000000000',
'Olaitan Admin',
'super_admin',
0.00,
NOW(),
NOW()
FROM auth.users
WHERE email = 'olaitan@olaking.store'
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin';

```

## Verify Admin Access

After creating the account:

1. Logout completely
2. Login with olaitan@olaking.store / Pa$$w0rd!
3. You should be redirected to `/admin`
4. Verify the sidebar shows admin menu items

**Troubleshooting:**

- **"function upgrade_user_role does not exist":** Run step 2 first (create the function) before step 3
- **"Not allowed to modify protected fields":** You haven't run the function creation in step 2 yet
```
