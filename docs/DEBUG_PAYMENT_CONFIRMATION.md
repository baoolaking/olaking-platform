# Debug Payment Confirmation Issue

## Step 1: Check Database Migration

First, run this SQL query in your Supabase SQL editor to check if the enum value exists:

```sql
-- Check if the awaiting_confirmation enum value exists
SELECT 
    enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'order_status'
)
ORDER BY enumsortorder;
```

**Expected Result**: You should see `awaiting_confirmation` in the list.

**If NOT present**, run the migration:
```sql
ALTER TYPE order_status ADD VALUE 'awaiting_confirmation';
```

## Step 2: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Click the "I've sent the money" button
4. Look for these log messages:

```
🔄 Starting payment confirmation for order: [ORDER_ID]
📡 Making API call to /api/wallet/confirm-payment
📡 API Response status: 200
✅ API Success: {success: true, message: "..."}
🔄 Switching to waiting state
```

**If you see errors**, note the exact error message.

## Step 3: Check Server Console

Look at your Next.js server console for these messages:

```
🔍 Payment confirmation API called
👤 User authenticated: [USER_ID]
📦 Order ID received: [ORDER_ID]
🔍 Order query result: {order: {...}, error: null}
📋 Current order status: awaiting_payment
🔄 Updating order status to awaiting_confirmation...
✅ Order status updated successfully
📧 Sending email to admin: [EMAIL]
✅ Email notification sent successfully
🎉 Payment confirmation completed successfully
```

## Step 4: Check Network Tab

1. Open Developer Tools → Network tab
2. Click "I've sent the money" button
3. Look for the `/api/wallet/confirm-payment` request
4. Check the response:

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Payment confirmation sent to admin"
}
```

**Error Response (400/500)**:
```json
{
  "error": "Specific error message"
}
```

## Step 5: Verify Database Update

After clicking the button, run this query to check if the status was updated:

```sql
SELECT 
    id,
    status,
    link,
    total_price,
    created_at,
    updated_at
FROM orders 
WHERE link = 'wallet_funding'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected**: The most recent order should have `status = 'awaiting_confirmation'`

## Common Issues & Solutions

### Issue 1: Enum Value Not Found
**Error**: `invalid input value for enum order_status: "awaiting_confirmation"`

**Solution**: Run the migration:
```sql
ALTER TYPE order_status ADD VALUE 'awaiting_confirmation';
```

### Issue 2: Order Not Found
**Error**: `Order not found or access denied`

**Possible Causes**:
- Order doesn't belong to the current user
- Order is not a wallet funding order (`link != 'wallet_funding'`)
- Order ID is incorrect

**Debug**: Check the order in the database:
```sql
SELECT * FROM orders WHERE id = 'YOUR_ORDER_ID';
```

### Issue 3: Wrong Status
**Error**: `Order is not in awaiting_payment status`

**Possible Causes**:
- Order was already confirmed
- Order status was manually changed
- Multiple clicks on the button

**Debug**: Check current status:
```sql
SELECT id, status FROM orders WHERE id = 'YOUR_ORDER_ID';
```

### Issue 4: Authentication Issues
**Error**: `Unauthorized`

**Solution**: 
- Make sure you're logged in
- Check if your session is valid
- Try refreshing the page and logging in again

## Step 6: Manual Testing

If the API is working but admin panel doesn't show the change:

1. **Refresh the admin page** - The admin panel might be cached
2. **Check the correct filter** - Make sure "Awaiting Confirmation" filter is available
3. **Clear browser cache** - Sometimes admin panels cache data

## Step 7: Force Refresh Admin Panel

Try these steps in the admin panel:
1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache and cookies
3. Check if the filter dropdown includes "Awaiting Confirmation"
4. Try filtering by "All Statuses" to see if the order appears

## Quick Fix Commands

If you need to manually update an order for testing:

```sql
-- Update specific order to awaiting_confirmation
UPDATE orders 
SET status = 'awaiting_confirmation', updated_at = NOW()
WHERE id = 'YOUR_ORDER_ID';

-- Check all wallet funding orders
SELECT id, status, created_at, updated_at 
FROM orders 
WHERE link = 'wallet_funding' 
ORDER BY created_at DESC;
```

## Report Back

Please share:
1. **Console logs** from both browser and server
2. **Network request/response** details
3. **Database query results** from the checks above
4. **Any error messages** you see

This will help identify exactly where the issue is occurring!