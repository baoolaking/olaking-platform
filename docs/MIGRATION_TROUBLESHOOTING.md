# Migration Troubleshooting Guide

## Quality Pricing Migration Issues

### Issue: Syntax Error with IF NOT EXISTS

**Error**: `syntax error at or near "NOT" LINE 27: ADD CONSTRAINT IF NOT EXISTS`

**Cause**: PostgreSQL doesn't support `IF NOT EXISTS` clause with `ADD CONSTRAINT`.

**Solution**: Use the updated migration scripts that use `DO $$` blocks to check for existing constraints.

### Migration Options

#### Option 1: Use the Fixed Complete Migration
Run `scripts/add-quality-pricing.sql` - this includes proper error handling and idempotent operations.

#### Option 2: Use Step-by-Step Migration
If you encounter issues with the complete migration, use `scripts/add-quality-pricing-simple.sql` and run each step separately:

1. **Add Columns**:
   ```sql
   ALTER TABLE services 
   ADD COLUMN IF NOT EXISTS high_quality_price_per_1k DECIMAL(10,2),
   ADD COLUMN IF NOT EXISTS low_quality_price_per_1k DECIMAL(10,2);
   ```

2. **Migrate Data**:
   ```sql
   UPDATE services 
   SET high_quality_price_per_1k = price_per_1k,
       low_quality_price_per_1k = price_per_1k * 0.7
   WHERE price_per_1k IS NOT NULL 
   AND (high_quality_price_per_1k IS NULL OR low_quality_price_per_1k IS NULL);
   ```

3. **Verify Data Migration**:
   ```sql
   SELECT id, platform, service_type, price_per_1k, high_quality_price_per_1k, low_quality_price_per_1k
   FROM services 
   WHERE high_quality_price_per_1k IS NULL OR low_quality_price_per_1k IS NULL;
   ```

4. **Set NOT NULL Constraints** (only after verifying data):
   ```sql
   ALTER TABLE services ALTER COLUMN high_quality_price_per_1k SET NOT NULL;
   ALTER TABLE services ALTER COLUMN low_quality_price_per_1k SET NOT NULL;
   ```

5. **Add Check Constraints** (only after NOT NULL is set):
   ```sql
   ALTER TABLE services ADD CONSTRAINT services_high_quality_price_positive CHECK (high_quality_price_per_1k > 0);
   ALTER TABLE services ADD CONSTRAINT services_low_quality_price_positive CHECK (low_quality_price_per_1k > 0);
   ```

### Verification Queries

After running the migration, verify it worked correctly:

```sql
-- Check column structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name IN ('price_per_1k', 'high_quality_price_per_1k', 'low_quality_price_per_1k')
ORDER BY column_name;

-- Check constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'services' 
AND constraint_name LIKE '%price%';

-- Check data migration
SELECT id, platform, service_type, price_per_1k, high_quality_price_per_1k, low_quality_price_per_1k
FROM services 
LIMIT 10;
```

### Common Issues and Solutions

#### Issue: Columns Already Exist
If you get an error that columns already exist, the migration is partially complete. Check which columns exist and continue from the appropriate step.

#### Issue: Data Migration Fails
If the UPDATE statement fails, check for:
- NULL values in price_per_1k
- Invalid data types
- Constraint violations

#### Issue: Constraint Already Exists
If you get "constraint already exists" errors, the constraints were already added. This is safe to ignore.

### Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove constraints
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_high_quality_price_positive;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_low_quality_price_positive;

-- Remove columns
ALTER TABLE services DROP COLUMN IF EXISTS high_quality_price_per_1k;
ALTER TABLE services DROP COLUMN IF EXISTS low_quality_price_per_1k;
```

### Testing After Migration

1. **Check Admin Interface**: Create/edit a service to ensure new pricing fields work
2. **Check User Interface**: Place a test order to verify pricing calculation
3. **Check Orders**: Verify orders are created with correct pricing information

### Support

If you continue to have issues:
1. Check your PostgreSQL version (should be 12+)
2. Verify you have appropriate permissions
3. Check for any custom constraints or triggers on the services table
4. Run the verification queries to see the current state