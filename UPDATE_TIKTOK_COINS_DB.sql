-- Update TikTok Coins service description in Supabase
-- Run this in your Supabase SQL Editor

UPDATE public.services
SET 
  description = 'TikTok coins - Packages: 200 (₦4k), 500 (₦10k), 1000 (₦20k), 1500 (₦30k), 5000 (₦100k), 10000 (₦200k). Save 25% with lower service fee. Contact via WhatsApp.',
  delivery_time = 'Instant'
WHERE 
  platform = 'tiktok' 
  AND service_type = 'coin';

-- Verify the update
SELECT 
  id,
  platform,
  service_type,
  description,
  delivery_time,
  is_active
FROM public.services
WHERE platform = 'tiktok' AND service_type = 'coin';
