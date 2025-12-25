# Troubleshooting: "I've sent the money" button not updating admin status

## Quick Diagnosis

### Step 1: Test the Debug Endpoint
Visit this URL in your browser (replace with your domain):
```
http://localhost:3000/api/debug/check-enum
```

**Expected Response:**
```json
{
  "success": true,
  "enumValues": [
    {"enum_value": "awaiting_payment"},
    {"enum_value": "awaiting_confirmation"},
    {"enum_value": "pending"},
    {"enum_value": "completed"},
    {"enum_value": "failed"},
    {"enum_value": "awaiting_refund"},
    {"enum_value": "refunded"}
  ],
  "recentOrders": [...],
  "timestamp": "2024-..."
}
```

**If `awaiting_confirmation` is missing**, you need to run the migration.

### Step 2: Run the Migration

Go to your Supabase SQL Editor and run:

```sql
-- Check current enum values
SELECT enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
ORDER BY enumsortorder;

-- If awaiting_confirmation is missing, add it:
ALTER TYPE order_status ADD VALUE 'awaiting_confirmation';

-- Verify it was added:
SELECT enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
ORDER BY enumsortorder;
```

### Step 3: Test the API Directly

Open your browser's console and run:

```javascript
// Replace 'YOUR_ORDER_ID' with an actual order ID
fetch('/api/wallet/confirm-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: 'YOUR_ORDER_ID' })
})
.then(res => res.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

### Step 4: Check Server Logs

Look at your Next.js development server console for detailed logs when you click the button.

## Common Issues & Solutions

### Issue 1: Migration Not Applied
**Symptoms:** 
- API returns enum error
- Debug endpoint shows missing `awaiting_confirmation`

**Solution:**
```sql
ALTER TYPE order_status ADD VALUE 'awaiting_confirmation';
```

### Issue 2: Order Not Found
**Symptoms:**
- API returns "Order not found or access denied"
- Console shows order query returning null

**Debug:**
```sql
-- Check if the order exists and belongs to the user
SELECT id, user_id, status, link 
FROM orders 
WHERE id = 'YOUR_ORDER_ID';
```

**Common Causes:**
- Wrong order ID
- Order doesn't belong to current user
- Order is not a wallet funding order

### Issue 3: Wrong Current Status
**Symptoms:**
- API returns "Order is not in awaiting_payment status"
- Order already processed

**Debug:**
```sql
-- Check current status
SELECT id, status, updated_at 
FROM orders 
WHERE id = 'YOUR_ORDER_ID';
```

**Solution:**
If order is already in `awaiting_confirmation`, that's actually correct! The admin panel should show this status.

### Issue 4: Admin Panel Not Refreshing
**Symptoms:**
- API works correctly
- Database shows correct status
- Admin panel still shows old status

**Solutions:**
1. **Hard refresh** admin panel (Ctrl+F5)
2. **Clear browser cache**
3. **Check filter settings** - make sure "All Statuses" is selected
4. **Verify admin components** have the new status option

## Manual Testing Commands

### Create Test Order
```sql
-- Create a test wallet funding order
INSERT INTO orders (
  user_id, service_id, quantity, price_per_1k, total_price,
  status, link, quality_type, payment_method, bank_account_id
) VALUES (
  'your-user-id', NULL, 1, 5000, 5000,
  'awaiting_payment', 'wallet_funding', 'high_quality', 'bank_transfer', 'bank-id'
) RETURNING id;
```

### Update Order Status Manually
```sql
-- Manually update order to test admin panel
UPDATE orders 
SET status = 'awaiting_confirmation', updated_at = NOW()
WHERE id = 'your-order-id';
```

### Check Admin Panel Components
Verify these files have the new status:

1. **Filter Dropdown:** `components/admin/orders/admin-order-filters.tsx`
   - Should include `<SelectItem value="awaiting_confirmation">Awaiting Confirmation</SelectItem>`

2. **Edit Dialog:** `components/admin/orders/edit-order-dialog.tsx`
   - Should include the same SelectItem

3. **Status Colors:** `components/admin/orders/orders-table.tsx`
   - Should have color for `awaiting_confirmation`

## Verification Checklist

- [ ] Migration applied (enum value exists)
- [ ] API endpoint works (returns success)
- [ ] Database updated (status changed)
- [ ] Admin components updated (new status in dropdowns)
- [ ] Admin panel refreshed (hard refresh)
- [ ] Browser cache cleared

## Still Not Working?

If you've completed all steps above and it's still not working:

1. **Share the exact error messages** from:
   - Browser console
   - Server console
   - Network tab response

2. **Share the results** of:
   - Debug endpoint response
   - Database enum query
   - Order status query

3. **Check if you're looking at the right order** in the admin panel:
   - Filter by "Wallet Funding" orders
   - Sort by newest first
   - Verify the order ID matches

## Emergency Fix

If you need to manually fix an order for testing:

```sql
-- Find the order
SELECT id, status FROM orders WHERE link = 'wallet_funding' ORDER BY created_at DESC LIMIT 5;

-- Update it manually
UPDATE orders SET status = 'awaiting_confirmation' WHERE id = 'YOUR_ORDER_ID';

-- Verify the change
SELECT id, status, updated_at FROM orders WHERE id = 'YOUR_ORDER_ID';
```

Then refresh the admin panel and check if it appears correctly.