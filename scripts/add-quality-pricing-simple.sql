-- Simple step-by-step migration for quality-based pricing
-- Run each section separately if needed

-- Step 1: Add new columns
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS high_quality_price_per_1k DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS low_quality_price_per_1k DECIMAL(10,2);

-- Step 2: Migrate existing data
UPDATE services 
SET high_quality_price_per_1k = price_per_1k,
    low_quality_price_per_1k = price_per_1k * 0.7
WHERE price_per_1k IS NOT NULL 
AND (high_quality_price_per_1k IS NULL OR low_quality_price_per_1k IS NULL);

-- Step 3: Set NOT NULL constraints (run only after data migration)
-- ALTER TABLE services ALTER COLUMN high_quality_price_per_1k SET NOT NULL;
-- ALTER TABLE services ALTER COLUMN low_quality_price_per_1k SET NOT NULL;

-- Step 4: Add check constraints (run only after NOT NULL is set)
-- ALTER TABLE services ADD CONSTRAINT services_high_quality_price_positive CHECK (high_quality_price_per_1k > 0);
-- ALTER TABLE services ADD CONSTRAINT services_low_quality_price_positive CHECK (low_quality_price_per_1k > 0);

-- Step 5: Add comments
COMMENT ON COLUMN services.high_quality_price_per_1k IS 'Price per 1000 units for high quality service';
COMMENT ON COLUMN services.low_quality_price_per_1k IS 'Price per 1000 units for low quality service';

-- Verification queries
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name IN ('price_per_1k', 'high_quality_price_per_1k', 'low_quality_price_per_1k')
ORDER BY column_name;

SELECT id, platform, service_type, price_per_1k, high_quality_price_per_1k, low_quality_price_per_1k
FROM services 
LIMIT 5;