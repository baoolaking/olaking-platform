# Testing Wallet Funding Confirmation Feature

## Quick Test Guide

### 1. Database Migration
First, run the migration to add the new enum value:

```sql
-- Run this in your Supabase SQL editor or via migration
ALTER TYPE order_status ADD VALUE 'awaiting_confirmation';
```

### 2. Test the Complete Flow

#### Step 1: Create a Wallet Funding Order
1. Go to `/dashboard/wallet`
2. Click "Fund Wallet"
3. Enter amount and select bank account
4. Submit the form
5. Note the order ID from the payment instructions

#### Step 2: Test Payment Confirmation
1. You should see the payment instructions with bank details
2. Look for the "I've sent the money" button
3. Click the button
4. Check the browser console for the API call
5. Verify the success toast message appears

#### Step 3: Verify Database Changes
Check the orders table to confirm status changed:

```sql
SELECT id, status, created_at, updated_at 
FROM orders 
WHERE link = 'wallet_funding' 
ORDER BY created_at DESC 
LIMIT 5;
```

#### Step 4: Check Email Notification
In development mode, check the server console logs for the email notification output.

### 3. Admin Panel Testing

#### Test Admin Filters
1. Go to `/admin/orders`
2. Check that "Awaiting Confirmation" appears in the status filter
3. Filter by this status to see orders waiting for confirmation

#### Test Status Updates
1. Find an order with "awaiting_confirmation" status
2. Click edit on the order
3. Verify "Awaiting Confirmation" appears in the status dropdown
4. Change status to "pending" to credit the wallet

### 4. API Testing with curl

Test the API endpoint directly:

```bash
# Replace ORDER_ID with actual order ID and add proper auth headers
curl -X POST http://localhost:3000/api/wallet/confirm-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"orderId": "ORDER_ID"}'
```

### 5. Expected Behaviors

#### Success Case
- Order status changes from `awaiting_payment` to `awaiting_confirmation`
- Email notification logged to console (development)
- User sees success message
- Admin can filter and edit orders with new status

#### Error Cases
- Invalid order ID: Returns 404
- Order not owned by user: Returns 404
- Order not in `awaiting_payment` status: Returns 400
- Missing authentication: Returns 401

### 6. Visual Verification

#### User Interface
- ✅ "I've sent the money" button appears in payment instructions
- ✅ Button shows loading state when clicked
- ✅ Success toast appears after confirmation
- ✅ Button includes send icon

#### Admin Interface
- ✅ New status appears in filter dropdown
- ✅ New status appears in edit dialog
- ✅ Status badge shows blue color for awaiting_confirmation
- ✅ Status text displays as "AWAITING CONFIRMATION"

### 7. Console Outputs to Look For

#### Development Email Log
```
📧 Email would be sent:
To: admin@example.com
Subject: Wallet Funding Payment Confirmation - Order [ORDER_ID]
From: noreply@example.com
HTML Content: [HTML email content]
```

#### API Success Response
```json
{
  "success": true,
  "message": "Payment confirmation sent to admin"
}
```

### 8. Troubleshooting

#### Common Issues
1. **Migration not applied**: Run the SQL migration first
2. **TypeScript errors**: Restart your dev server after type changes
3. **Email not logging**: Check server console, not browser console
4. **Button not appearing**: Verify orderId prop is passed correctly

#### Debug Steps
1. Check browser network tab for API calls
2. Verify order exists and belongs to user
3. Check server logs for detailed error messages
4. Confirm environment variables are set correctly