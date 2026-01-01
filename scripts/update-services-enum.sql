-- Update Services Enum Script
-- This script adds the new comprehensive service types to your database
-- Run this in your Supabase SQL editor or via psql

-- First, let's see what services currently exist
SELECT platform, service_type, COUNT(*) as count 
FROM services 
GROUP BY platform, service_type 
ORDER BY platform, service_type;

-- Add the new comprehensive services
-- Note: This uses ON CONFLICT DO NOTHING to avoid duplicates
INSERT INTO services (
  platform,
  service_type,
  description,
  high_quality_price_per_1k,
  low_quality_price_per_1k,
  price_per_1k,
  min_quantity,
  max_quantity,
  delivery_time,
  is_active
) VALUES
  -- TikTok Services
  ('tiktok', 'coin', 'TikTok coins for gifting and support', 5000, 3500, 5000, 100, 50000, '1-6 hours', true),
  ('tiktok', 'followers', 'High-quality TikTok followers delivered gradually', 2500, 1750, 2500, 100, 100000, '1-24 hours', true),
  ('tiktok', 'views', 'TikTok video views to boost engagement', 500, 350, 500, 1000, 1000000, '1-12 hours', true),
  ('tiktok', 'video comments', 'Custom TikTok video comments from real users', 5000, 3500, 5000, 10, 1000, '1-48 hours', true),
  ('tiktok', 'add to favorites', 'Add TikTok videos to favorites', 2000, 1400, 2000, 50, 10000, '1-24 hours', true),
  ('tiktok', 'likes', 'Real TikTok likes from active users', 1500, 1050, 1500, 50, 100000, '1-12 hours', true),
  ('tiktok', 'shares', 'TikTok video shares from real accounts', 3000, 2100, 3000, 50, 50000, '1-24 hours', true),
  ('tiktok', 'live views', 'TikTok live stream views', 800, 560, 800, 100, 50000, 'During live', true),

  -- Instagram Services
  ('instagram', 'save post', 'Instagram post saves from real accounts', 2500, 1750, 2500, 50, 50000, '1-24 hours', true),
  ('instagram', 'page follow', 'Instagram page followers from active users', 2000, 1400, 2000, 100, 50000, '1-48 hours', true),
  ('instagram', 'post likes', 'Instagram post likes delivered fast', 1200, 840, 1200, 50, 100000, '1-12 hours', true),
  ('instagram', 'post repost', 'Instagram post reposts/shares', 3500, 2450, 3500, 20, 10000, '1-24 hours', true),
  ('instagram', 'post comments', 'Custom Instagram post comments', 4500, 3150, 4500, 10, 1000, '1-48 hours', true),
  ('instagram', 'post views', 'Instagram post and story views', 800, 560, 800, 500, 500000, '1-12 hours', true),
  ('instagram', 'share to story', 'Instagram story shares', 4000, 2800, 4000, 20, 5000, '1-24 hours', true),
  ('instagram', 'reel sound use', 'Instagram reel audio usage', 6000, 4200, 6000, 10, 2000, '1-72 hours', true),
  ('instagram', 'vote', 'Instagram story poll votes', 3000, 2100, 3000, 50, 10000, '1-24 hours', true),

  -- Facebook Services
  ('facebook', 'page like', 'Facebook page likes from real accounts', 2200, 1540, 2200, 100, 50000, '1-48 hours', true),
  ('facebook', 'video view', 'Facebook video views', 600, 420, 600, 1000, 500000, '1-12 hours', true),
  ('facebook', 'group join', 'Facebook group members', 3500, 2450, 3500, 50, 10000, '1-72 hours', true),
  ('facebook', 'video share', 'Facebook video shares', 4000, 2800, 4000, 20, 5000, '1-24 hours', true),
  ('facebook', 'post comments', 'Facebook post comments', 4500, 3150, 4500, 10, 1000, '1-48 hours', true),
  ('facebook', 'post likes', 'Facebook post likes', 1800, 1260, 1800, 50, 50000, '1-24 hours', true),
  ('facebook', 'post share', 'Facebook post shares', 3500, 2450, 3500, 20, 10000, '1-24 hours', true),
  ('facebook', 'post review', 'Facebook page reviews', 8000, 5600, 8000, 5, 500, '1-72 hours', true),
  ('facebook', 'page follow', 'Facebook page followers', 2500, 1750, 2500, 100, 50000, '1-48 hours', true),

  -- YouTube Services
  ('youtube', 'video like', 'YouTube video likes from real accounts', 4000, 2800, 4000, 50, 10000, '1-24 hours', true),
  ('youtube', 'video view', 'YouTube video views with watch time', 3000, 2100, 3000, 1000, 1000000, '1-48 hours', true),
  ('youtube', 'video share', 'YouTube video shares', 5000, 3500, 5000, 20, 5000, '1-24 hours', true),
  ('youtube', 'video comments', 'YouTube video comments', 6000, 4200, 6000, 10, 500, '1-72 hours', true),
  ('youtube', 'channel subscribe', 'YouTube channel subscribers', 8000, 5600, 8000, 50, 10000, '1-72 hours', true),
  ('youtube', '5 min watch hour', 'YouTube 5-minute watch time', 4500, 3150, 4500, 100, 50000, '1-48 hours', true),

  -- X (Twitter) Services
  ('x', 'repost with quote', 'X retweets with quote', 4500, 3150, 4500, 20, 5000, '1-24 hours', true),
  ('x', 'tweet repost', 'X tweet retweets for visibility', 3500, 2450, 3500, 20, 10000, '1-24 hours', true),
  ('x', 'tweet comments', 'X tweet replies/comments', 5000, 3500, 5000, 10, 1000, '1-48 hours', true),
  ('x', 'tweet like', 'X tweet likes', 2000, 1400, 2000, 50, 50000, '1-12 hours', true),
  ('x', 'page follow', 'X profile followers from active users', 3000, 2100, 3000, 100, 50000, '1-48 hours', true),
  ('x', 'tweet views', 'X tweet impressions/views', 800, 560, 800, 1000, 500000, '1-12 hours', true),

  -- WhatsApp Services
  ('whatsapp', 'channel post like', 'WhatsApp channel post reactions', 3000, 2100, 3000, 50, 10000, '1-24 hours', true),
  ('whatsapp', 'community', 'WhatsApp community members', 4000, 2800, 4000, 50, 5000, '1-72 hours', true),
  ('whatsapp', 'group', 'WhatsApp group members', 3500, 2450, 3500, 50, 5000, '1-48 hours', true),
  ('whatsapp', 'contact save', 'WhatsApp contact saves', 2500, 1750, 2500, 100, 10000, '1-24 hours', true),
  ('whatsapp', 'channel follow', 'WhatsApp channel followers', 2800, 1960, 2800, 100, 20000, '1-48 hours', true),

  -- Telegram Services
  ('telegram', 'channel/group members', 'Telegram channel/group members', 3500, 2450, 3500, 100, 50000, '1-72 hours', true)
ON CONFLICT DO NOTHING;

-- Verify the new services were added
SELECT 
  platform, 
  COUNT(*) as total_services,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_services
FROM services 
GROUP BY platform 
ORDER BY platform;

-- Show all services by platform
SELECT platform, service_type, high_quality_price_per_1k, low_quality_price_per_1k, is_active
FROM services 
ORDER BY platform, service_type;