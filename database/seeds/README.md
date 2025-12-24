# Database Seeding Guide

This guide walks you through seeding your Olaking platform database with initial data.

## Prerequisites

- Supabase project set up and running
- Database schema, RLS policies, functions, and triggers already created
- Access to Supabase SQL Editor

## Seeding Steps

### 1. Seed Super Admin Account

The super admin account has full access to the admin dashboard and can manage all platform resources.

**Credentials:**

- Email: `olaitan@olaking.store`
- Password: `Pa$$w0rd!`

**Method 1: Using the Register UI (Recommended)**

1. Go to your app's register page at `/register`
2. Fill in the registration form:
   - Email: `olaitan@olaking.store`
   - Password: `Pa$$w0rd!`
   - Full Name: `Super Admin`
   - Username: `olaitan`
   - WhatsApp: Your WhatsApp number (e.g., `+2348012345678`)
3. Click "Register"
4. After successful registration, open Supabase SQL Editor
5. Run this SQL to upgrade the account to super admin:

```sql
UPDATE users
SET role = 'super_admin'
WHERE email = 'olaitan@olaking.store';
```

6. Verify the update:

```sql
SELECT id, email, username, full_name, role, created_at
FROM users
WHERE email = 'olaitan@olaking.store';
```

7. Sign out and sign back in to apply the new role
8. You should now be able to access `/admin`

**Method 2: Using SQL Script**

If you prefer to use SQL directly, see the detailed alternative method in [`01_seed_super_admin.sql`](./01_seed_super_admin.sql).

### 2. Seed Platform Data

After creating your super admin account, seed the initial platform data including settings, bank accounts, and services.

1. Open [`02_seed_platform_data.sql`](./02_seed_platform_data.sql)
2. **IMPORTANT:** Update the following values before running:
   - `support_whatsapp`: Replace with your actual WhatsApp number
   - Bank account details: Replace with your real bank accounts
3. Run the script in Supabase SQL Editor
4. Verify the data was inserted successfully

The script will insert:

- Admin settings (platform name, support contacts, timeouts)
- Bank accounts for receiving payments
- Sample services for TikTok, Instagram, YouTube, and Twitter

### 3. Verify Everything is Working

After seeding:

1. **Test Super Admin Login:**

   - Go to `/login`
   - Login with `olaitan@olaking.store` / `Pa$$w0rd!`
   - You should be redirected to `/admin`

2. **Check Admin Dashboard:**

   - Navigate to `/admin`
   - You should see the admin dashboard with stats
   - All navigation links should work:
     - Dashboard
     - Users
     - Orders
     - Services
     - Bank Accounts
     - Settings

3. **Verify Data:**
   - Go to `/admin/services` - you should see all seeded services
   - Go to `/admin/bank-accounts` - you should see the bank accounts
   - Go to `/admin/settings` - you should see the platform settings

## Customization

### Add More Services

To add more services, insert into the `services` table:

```sql
INSERT INTO services (
  platform,
  service_type,
  description,
  price_per_1k,
  min_quantity,
  max_quantity,
  is_active
) VALUES (
  'tiktok',
  'saves',
  'TikTok video saves',
  2000,
  50,
  50000,
  true
);
```

### Add More Bank Accounts

```sql
INSERT INTO bank_accounts (
  bank_name,
  account_name,
  account_number,
  is_active
) VALUES (
  'Zenith Bank',
  'Your Business Name',
  '1234567890',
  true
);
```

### Update Platform Settings

```sql
UPDATE admin_settings
SET
  platform_name = 'Your Platform Name',
  support_email = 'your@email.com',
  support_whatsapp = '+234XXXXXXXXXX',
  auto_cancel_hours = 48
WHERE id = 1;
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change the default password** after first login:

   - Go to your profile settings
   - Update the password to something secure

2. **Keep super admin accounts minimal:**

   - Only create super admin accounts for trusted team members
   - Use sub_admin role for regular admin users

3. **Enable Two-Factor Authentication:**

   - Consider enabling 2FA in Supabase Auth settings
   - Add extra security for admin accounts

4. **Regularly backup your database:**
   - Use Supabase's backup features
   - Keep backups of your data

## Troubleshooting

### Can't access /admin after login

**Solution:** Make sure you updated the role to `super_admin`:

```sql
SELECT role FROM users WHERE email = 'olaitan@olaking.store';
```

If it's still `user`, run the UPDATE query again.

### Services not showing up

**Solution:** Check if the services were inserted:

```sql
SELECT COUNT(*) FROM services;
```

If count is 0, run the seed script again.

### Bank accounts not visible

**Solution:** Verify insertion:

```sql
SELECT * FROM bank_accounts;
```

If empty, run the seed script again.

## Next Steps

After successful seeding:

1. ✅ Update bank account details with real information
2. ✅ Customize service pricing based on your costs
3. ✅ Update platform settings with your contact information
4. ✅ Test the entire user flow (register → order → payment)
5. ✅ Test the admin flow (verify payment → update order status)
6. ✅ Change the super admin password
7. ✅ Add more admin users if needed (create account, then update role to `sub_admin`)

## Support

If you encounter any issues during seeding:

1. Check the Supabase logs for errors
2. Verify all database migrations ran successfully
3. Ensure RLS policies are properly configured
4. Check that all database functions and triggers are created

Happy seeding! 🎉
