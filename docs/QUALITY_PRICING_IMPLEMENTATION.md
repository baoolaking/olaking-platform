# Quality-Based Pricing Implementation

This document outlines the implementation of high quality and low quality pricing fields across the platform.

## Overview

The platform now supports separate pricing for high quality and low quality services. This allows administrators to set different prices for the same service based on quality level, giving users more options when placing orders.

## Database Changes

### New Columns Added to `services` Table

- `high_quality_price_per_1k` (DECIMAL(10,2), NOT NULL) - Price per 1000 units for high quality service
- `low_quality_price_per_1k` (DECIMAL(10,2), NOT NULL) - Price per 1000 units for low quality service

### Migration Details

- **Migration File**: `database/migrations/005_add_quality_pricing_fields.sql`
- **Script File**: `scripts/add-quality-pricing.sql`
- **Data Migration**: Existing `price_per_1k` values are copied to `high_quality_price_per_1k`, and `low_quality_price_per_1k` is set to 70% of the high quality price
- **Backward Compatibility**: The original `price_per_1k` column is retained for backward compatibility

## Code Changes

### 1. Database Types (`types/database.ts`)
- Updated `services` table types to include new pricing fields
- Added `high_quality_price_per_1k` and `low_quality_price_per_1k` to Row, Insert, and Update types

### 2. Service Types (`components/services/types.ts`)
- Added optional `high_quality_price_per_1k` and `low_quality_price_per_1k` fields to Service interface

### 3. Pricing Utilities (`lib/wallet/utils.ts`)
- **Updated `calculateServicePrice()`**: Now accepts service object and quality type parameter
- **Added `getPricePerK()`**: Helper function to get price per 1k for specific quality type
- Both functions handle both new quality-based pricing and legacy pricing structures

### 4. Admin Service Management

#### ServiceForm Component (`components/admin/ServiceForm.tsx`)
- Replaced single price input with two separate inputs for high and low quality pricing
- Added visual grouping and helper text for pricing fields
- Updated form submission to handle new pricing fields

#### ServicesTable Component (`components/admin/ServicesTable.tsx`)
- Updated pricing column to show both high and low quality prices
- Modified mobile view to display both pricing options
- Enhanced table layout to accommodate dual pricing display

#### Service Actions (`app/admin/services/actions.ts`)
- Updated `createService()` and `updateService()` functions to handle new pricing fields
- Added audit logging for new pricing fields
- Maintained backward compatibility by setting `price_per_1k` to high quality price

### 5. User-Facing Components

#### OrderFormModal (`components/services/order-form-modal.tsx`)
- Updated pricing calculation to use quality-based pricing
- Enhanced price display to show selected quality type and corresponding price
- Modified order creation to send correct price per 1k based on quality selection

#### ServiceCard (`components/services/service-card.tsx`)
- Updated to display both high and low quality pricing
- Improved visual layout with separate badges for each quality level

### 6. Order Management

#### Admin Orders Table (`components/admin/orders/orders-table.tsx`)
- Added new "Pricing" column showing price per 1k and quality type
- Enhanced order information display

#### User Orders Table (`components/dashboard/orders/orders-table.tsx`)
- Already supported quality type display in expanded view
- No changes needed as it uses the `price_per_1k` field from orders table

## User Experience Improvements

### For Administrators
1. **Service Creation/Editing**: Clear interface to set different prices for high and low quality
2. **Service Overview**: Easy comparison of pricing across quality levels
3. **Order Management**: Clear visibility of which quality level was selected for each order

### For Users
1. **Service Selection**: Clear pricing information for both quality options
2. **Order Placement**: Dynamic price calculation based on selected quality
3. **Order History**: Quality level and pricing information preserved in order details

## Quality Pricing Logic

- **High Quality**: Premium service with higher price point
- **Low Quality**: Standard service with lower price point (default: 70% of high quality price)
- **Default Selection**: High quality is selected by default in order forms
- **Backward Compatibility**: Services without new pricing fields fall back to original `price_per_1k`

## Migration Instructions

1. **Run Database Migration**:
   ```sql
   -- Execute the contents of scripts/add-quality-pricing.sql in your Supabase SQL editor
   ```

2. **Verify Migration**:
   - Check that new columns exist in services table
   - Verify data migration completed successfully
   - Confirm constraints are in place

3. **Update Service Pricing**:
   - Review and adjust pricing for existing services through admin interface
   - Set appropriate high and low quality prices for each service

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Admin can create new services with quality-based pricing
- [ ] Admin can edit existing services and update pricing
- [ ] Services table displays both pricing options correctly
- [ ] Users can select quality type when placing orders
- [ ] Price calculation updates dynamically based on quality selection
- [ ] Orders are created with correct pricing information
- [ ] Order tables display quality and pricing information correctly
- [ ] Backward compatibility maintained for existing orders

## Future Considerations

1. **Remove Legacy Column**: In a future migration, the `price_per_1k` column can be removed once all code is fully migrated
2. **Quality Descriptions**: Consider adding description fields for quality levels
3. **Percentage-Based Pricing**: Consider allowing admins to set low quality as a percentage of high quality
4. **Additional Quality Levels**: Framework supports extension to more quality levels if needed

## Files Modified

### Database
- `database/migrations/005_add_quality_pricing_fields.sql`
- `scripts/add-quality-pricing.sql`
- `types/database.ts`

### Components
- `components/admin/ServiceForm.tsx`
- `components/admin/ServicesTable.tsx`
- `components/admin/orders/orders-table.tsx`
- `components/services/order-form-modal.tsx`
- `components/services/service-card.tsx`
- `components/services/types.ts`

### Actions & Utilities
- `app/admin/services/actions.ts`
- `lib/wallet/utils.ts`

### Documentation
- `docs/QUALITY_PRICING_IMPLEMENTATION.md` (this file)