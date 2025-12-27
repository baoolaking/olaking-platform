# Service Order Email Notifications

## Overview

This implementation ensures that admin users receive email notifications whenever customers place service orders, similar to how wallet funding notifications work.

## Key Features

1. **Immediate Notifications**: Admins are notified as soon as orders are placed
2. **Payment Method Awareness**: Different notifications for wallet vs bank transfer orders
3. **Comprehensive Order Details**: All relevant order information included in emails
4. **Multiple Admin Support**: Emails sent to all active admin users
5. **Fallback Handling**: Graceful handling when email service fails

## Architecture

### 1. Order Creation Flow

#### New API Endpoint: `/api/orders/create`
- **Purpose**: Centralized order creation with email notifications
- **Replaces**: Direct database inserts in components
- **Benefits**: Better error handling, email notifications, consistent logging

```typescript
POST /api/orders/create
{
  "service_id": "uuid",
  "quantity": 1000,
  "price_per_1k": 50,
  "total_price": 50,
  "status": "pending",
  "link": "https://example.com",
  "quality_type": "high_quality",
  "payment_method": "wallet",
  "bank_account_id": "uuid"
}
```

### 2. Email Notification Types

#### Wallet Orders (Immediate Processing)
- **Subject**: "New Service Order (Wallet Payment) - Order {orderId}"
- **Content**: Order ready for immediate processing
- **Action Required**: Begin processing the order
- **Payment Status**: Already paid and deducted from wallet

#### Bank Transfer Orders (Payment Confirmation)
- **Subject**: "Service Order Payment Confirmation - Order {orderId}"
- **Content**: Customer claims to have sent payment
- **Action Required**: Verify payment before processing
- **Payment Status**: Awaiting confirmation

### 3. Email Service Integration

#### Enhanced `sendServiceOrderNotification` Function
```typescript
await sendServiceOrderNotification({
  orderId: string,
  userEmail: string,
  userName: string,
  amount: number,
  serviceName: string,
  paymentMethod: 'wallet' | 'bank_transfer',
  adminEmails: string[],
});
```

#### Admin Email Discovery
- Uses `getActiveAdminEmails()` function
- Queries database for active admin users
- Falls back to environment variables if needed
- Supports multiple admin recipients

## Implementation Details

### 1. Order Creation Process

1. **User Submits Order Form**
   - Order form modal validates input
   - Calls `/api/orders/create` endpoint

2. **API Processing**
   - Validates user authentication
   - Fetches user and service details
   - Creates order in database
   - Determines email notification type

3. **Email Notification**
   - Gets active admin email addresses
   - Formats service name for display
   - Sends appropriate notification based on payment method
   - Logs success/failure without failing order creation

4. **Response Handling**
   - Returns order details to client
   - Continues with wallet deduction if needed
   - Updates UI with success/error messages

### 2. Email Content Structure

#### Wallet Order Email
```html
🛒 New Service Order (Paid)

A customer has placed a new service order and paid with their wallet balance. 
The order is ready for processing.

Order Details:
- Order: ORD-12345
- Customer: John Doe
- Email: john@example.com
- Service: Instagram Followers
- Amount: ₦5,000
- Payment: Wallet (Already Paid)
- Status: Pending (Ready to Process)

Next Steps (Wallet Order):
1. Log into the admin panel
2. Navigate to Orders → Service Orders
3. Find order ORD-12345 (status: pending)
4. Begin processing the order immediately
5. Update status to "completed" when finished

Note: Payment has already been deducted from the customer's wallet.
```

#### Bank Transfer Order Email
```html
🛒 Service Order Payment Confirmation

A customer has confirmed they have sent payment for a service order 
and is awaiting verification.

Order Details:
- Order: ORD-12345
- Customer: John Doe
- Email: john@example.com
- Service: Instagram Followers
- Amount: ₦5,000
- Payment: Bank Transfer (Awaiting Confirmation)
- Status: Awaiting Confirmation

Next Steps (Bank Transfer):
1. Check your bank account for the payment of ₦5,000
2. Log into the admin panel
3. Navigate to Orders → Service Orders
4. Find order ORD-12345 and verify the payment
5. Update status to "pending" to start processing the order
```

### 3. Error Handling

#### Email Failures
- Order creation continues even if email fails
- Errors logged but don't affect user experience
- Fallback to environment variables for admin emails
- Console logging for debugging

#### Order Creation Failures
- Proper error responses to client
- Database rollback on failures
- User-friendly error messages
- Detailed server-side logging

## Files Created/Modified

### New Files
- `app/api/orders/create/route.ts` - Centralized order creation API
- `docs/SERVICE_ORDER_EMAIL_NOTIFICATIONS.md` - This documentation

### Modified Files
- `lib/email/service.ts` - Enhanced service order notification function
- `components/services/order-form-modal.tsx` - Updated to use new API
- `app/api/orders/confirm-payment/route.ts` - Updated email function signature

## Configuration

### Environment Variables
```env
# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Fallback Admin Email
RESEND_ADMIN_EMAIL=admin@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### Database Requirements
- `get_active_admin_emails()` RPC function
- Active admin users in `users` table
- Proper email addresses for admin users

## Testing

### Manual Testing
1. **Wallet Order Test**:
   - Place order with wallet payment
   - Check admin email for immediate processing notification
   - Verify order status is "pending"

2. **Bank Transfer Order Test**:
   - Place order with bank transfer payment
   - Check admin email for payment confirmation request
   - Verify order status is "awaiting_payment"

3. **Email Fallback Test**:
   - Temporarily disable database admin query
   - Verify fallback to environment variable works

### Debug Logging
- All email operations logged to console
- Order creation steps tracked
- Error details captured for troubleshooting

## Benefits

1. **Improved Admin Workflow**: Immediate notifications for new orders
2. **Better Customer Service**: Faster order processing and response times
3. **Payment Clarity**: Clear distinction between paid and unpaid orders
4. **Audit Trail**: Complete logging of order creation and notifications
5. **Scalability**: Supports multiple admin users and email providers

## Future Enhancements

1. **Email Templates**: Move to external template system
2. **SMS Notifications**: Add SMS alerts for urgent orders
3. **Slack Integration**: Send notifications to admin Slack channels
4. **Order Tracking**: Email updates when order status changes
5. **Customer Notifications**: Confirmation emails to customers