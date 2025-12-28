-- Add high quality and low quality pricing fields to services table
-- This migration adds separate pricing for high and low quality services

-- Add new columns for quality-based pricing
ALTER TABLE services 
ADD COLUMN high_quality_price_per_1k DECIMAL(10,2),
ADD COLUMN low_quality_price_per_1k DECIMAL(10,2);

-- Migrate existing price_per_1k data to high_quality_price_per_1k
-- Assuming existing prices are for high quality services
UPDATE services 
SET high_quality_price_per_1k = price_per_1k,
    low_quality_price_per_1k = price_per_1k * 0.7  -- Low quality is 70% of high quality price
WHERE price_per_1k IS NOT NULL;

-- Make the new columns NOT NULL after data migration
DO $$ 
BEGIN
    -- Set high_quality_price_per_1k to NOT NULL if it's currently nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'high_quality_price_per_1k' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE services ALTER COLUMN high_quality_price_per_1k SET NOT NULL;
    END IF;
    
    -- Set low_quality_price_per_1k to NOT NULL if it's currently nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'low_quality_price_per_1k' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE services ALTER COLUMN low_quality_price_per_1k SET NOT NULL;
    END IF;
END $$;

-- Add constraints to ensure prices are positive
DO $$ 
BEGIN
    -- Add high quality price constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'services_high_quality_price_positive' 
        AND table_name = 'services'
    ) THEN
        ALTER TABLE services 
        ADD CONSTRAINT services_high_quality_price_positive CHECK (high_quality_price_per_1k > 0);
    END IF;
    
    -- Add low quality price constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'services_low_quality_price_positive' 
        AND table_name = 'services'
    ) THEN
        ALTER TABLE services 
        ADD CONSTRAINT services_low_quality_price_positive CHECK (low_quality_price_per_1k > 0);
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN services.high_quality_price_per_1k IS 'Price per 1000 units for high quality service';
COMMENT ON COLUMN services.low_quality_price_per_1k IS 'Price per 1000 units for low quality service';

-- Note: We're keeping the old price_per_1k column for backward compatibility
-- It can be removed in a future migration once all code is updated