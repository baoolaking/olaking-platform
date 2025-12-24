-- Seed Initial Platform Data
-- Run this after setting up your super admin account

-- 1. Insert Admin Settings (key/value schema)
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
  ('platform_name', 'Olaking', 'Platform display name'),
  ('support_email', 'support@olaking.store', 'Support contact email'),
  ('support_whatsapp', '+234XXXXXXXXXX', 'Primary WhatsApp support number'),
  ('auto_cancel_hours', '24', 'Hours before auto-cancelling unpaid orders'),
  ('payment_verification_hours', '2', 'Hours allowed for payment verification'),
  ('is_maintenance', 'false', 'Maintenance mode flag'),
  ('maintenance_message', 'We are currently undergoing maintenance. Please check back soon.', 'Maintenance notice message')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. Insert Sample Bank Accounts (replace with real bank details)
INSERT INTO bank_accounts (bank_name, account_name, account_number, is_active) VALUES
  ('GTBank', 'Olaking Limited', '0123456789', true),
  ('Access Bank', 'Olaking Limited', '0987654321', true)
ON CONFLICT DO NOTHING;

-- 3. Insert Sample Services (TikTok services)
INSERT INTO services (
  platform,
  service_type,
  description,
  price_per_1k,
  min_quantity,
  max_quantity,
  is_active
) VALUES
  ('tiktok', 'followers', 'High-quality TikTok followers delivered gradually', 2500, 100, 100000, true),
  ('tiktok', 'likes', 'Real TikTok likes from active users', 1500, 50, 100000, true),
  ('tiktok', 'views', 'TikTok video views to boost engagement', 500, 1000, 1000000, true),
  ('tiktok', 'shares', 'TikTok video shares from real accounts', 3000, 50, 50000, true),
  ('tiktok', 'comments', 'Custom TikTok comments from real users', 5000, 10, 1000, true),
  ('instagram', 'followers', 'Instagram followers from real accounts', 2000, 100, 50000, true),
  ('instagram', 'likes', 'Instagram post likes delivered fast', 1200, 50, 100000, true),
  ('instagram', 'views', 'Instagram story and reel views', 800, 500, 500000, true),
  ('youtube', 'subscribers', 'YouTube channel subscribers', 8000, 50, 10000, true),
  ('youtube', 'views', 'YouTube video views with watch time', 3000, 1000, 1000000, true),
  ('youtube', 'likes', 'YouTube video likes from real accounts', 4000, 50, 10000, true),
  ('x', 'followers', 'Twitter/X followers from active users', 3000, 100, 50000, true),
  ('x', 'likes', 'Twitter/X post likes', 2000, 50, 50000, true),
  ('x', 'retweets', 'Twitter/X retweets for visibility', 3500, 20, 10000, true)
ON CONFLICT DO NOTHING;

-- 4. Verify the data
SELECT 'Admin Settings' as table_name, COUNT(*) as count FROM admin_settings
UNION ALL
SELECT 'Bank Accounts', COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'Services', COUNT(*) FROM services;

-- Success message
SELECT 'Platform data seeded successfully!' as status;
