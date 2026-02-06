-- Create TikTok Coin Packages Table
-- This table stores the dynamic pricing for TikTok coin packages

CREATE TABLE IF NOT EXISTS public.tiktok_coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coins INTEGER NOT NULL,
  price INTEGER NOT NULL,
  display_price TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on coins amount
ALTER TABLE public.tiktok_coin_packages 
ADD CONSTRAINT unique_coins UNIQUE (coins);

-- Create index for faster queries
CREATE INDEX idx_tiktok_packages_active ON public.tiktok_coin_packages(is_active);
CREATE INDEX idx_tiktok_packages_sort ON public.tiktok_coin_packages(sort_order);

-- Enable RLS
ALTER TABLE public.tiktok_coin_packages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active packages (public access)
CREATE POLICY "Anyone can view active TikTok coin packages"
  ON public.tiktok_coin_packages
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert packages
CREATE POLICY "Admins can insert TikTok coin packages"
  ON public.tiktok_coin_packages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'sub_admin')
    )
  );

-- Policy: Only admins can update packages
CREATE POLICY "Admins can update TikTok coin packages"
  ON public.tiktok_coin_packages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'sub_admin')
    )
  );

-- Policy: Only super admins can delete packages
CREATE POLICY "Super admins can delete TikTok coin packages"
  ON public.tiktok_coin_packages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Insert default packages
INSERT INTO public.tiktok_coin_packages (coins, price, display_price, is_popular, sort_order) VALUES
  (200, 4000, '₦4,000', false, 1),
  (500, 10000, '₦10,000', false, 2),
  (1000, 20000, '₦20,000', false, 3),
  (1500, 30000, '₦30,000', true, 4),
  (5000, 100000, '₦100,000', false, 5),
  (10000, 200000, '₦200,000', false, 6)
ON CONFLICT (coins) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tiktok_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tiktok_packages_updated_at
  BEFORE UPDATE ON public.tiktok_coin_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_tiktok_packages_updated_at();

-- Add comment
COMMENT ON TABLE public.tiktok_coin_packages IS 'Stores TikTok coin package pricing that can be managed by admins';
