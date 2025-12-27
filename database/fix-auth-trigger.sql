-- Fix authentication issue by creating the missing handle_new_user trigger
-- This trigger creates a record in public.users when a user is created in auth.users

-- First, create the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, whatsapp_no, full_name, role, is_active)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'whatsapp_no',
    new.raw_user_meta_data->>'full_name',
    'user', -- default role
    true     -- default active status
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that calls the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now fix existing users who are in auth.users but not in public.users
-- This will create public.users records for existing auth users
INSERT INTO public.users (id, email, username, whatsapp_no, full_name, role, is_active)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'username' as username,
  au.raw_user_meta_data->>'whatsapp_no' as whatsapp_no,
  au.raw_user_meta_data->>'full_name' as full_name,
  'user' as role,
  true as is_active
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL  -- Only insert users that don't exist in public.users
AND au.email IS NOT NULL;  -- Only users with valid emails

-- Display results
SELECT 'Migration completed. Users should now be able to login.' as status;