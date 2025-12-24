-- Seed Super Admin Account
-- This script creates the first super admin account for the platform
-- Email: olaitan@olaking.store
-- Password: Pa$$w0rd!

-- IMPORTANT: Run these steps in order

-- Step 1: First, register the account using the register page at /register
-- with the following details:
-- - Email: olaitan@olaking.store
-- - Password: Pa$$w0rd!
-- - Full Name: Super Admin
-- - Username: olaitan
-- - WhatsApp: (your WhatsApp number)

-- Step 2: After successful registration, run this SQL in Supabase SQL Editor
-- to upgrade the account to super_admin role:

UPDATE users 
SET role = 'super_admin'
WHERE email = 'olaitan@olaking.store';

-- Step 3: Verify the update
SELECT id, email, username, full_name, role, created_at 
FROM users 
WHERE email = 'olaitan@olaking.store';

-- Expected result:
-- The role column should now show 'super_admin'

-- Step 4: Sign out and sign back in to apply the new role
-- You should now have access to the /admin dashboard

-- ALTERNATIVE METHOD (if you prefer direct SQL insert):
-- Note: This method requires generating a proper password hash
-- It's recommended to use the register UI method above instead

-- If you choose this method, you'll need to:
-- 1. Create the auth.users record via Supabase Dashboard (easier)
-- 2. Or use this SQL with proper password hashing:

/*
-- Insert into auth.users (replace with actual hashed password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'olaitan@olaking.store',
  crypt('Pa$$w0rd!', gen_salt('bf')), -- Password hash
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  NOW(),
  NOW(),
  NULL
) RETURNING id;

-- Then insert into public.users (use the ID from above)
INSERT INTO public.users (
  id,
  email,
  username,
  full_name,
  whatsapp_no,
  role,
  wallet_balance,
  is_active
) VALUES (
  'YOUR_AUTH_USER_ID_HERE', -- Replace with the ID from auth.users insert
  'olaitan@olaking.store',
  'olaitan',
  'Super Admin',
  '1234567890', -- Replace with actual WhatsApp number
  'super_admin',
  0,
  true
);
*/

-- NOTES:
-- - The register UI method is simpler and safer
-- - Make sure to change the password after first login
-- - The super_admin role has full access to all admin features
-- - Only create super admin accounts for trusted administrators
