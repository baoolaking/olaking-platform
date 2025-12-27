# Admin Email Security Implementation

## Overview
This document explains the security implementation for fetching admin emails when sending order notifications.

## Security Considerations

### Problem
Initially, the system was trying to query the `users` table directly from the email service using a regular authenticated client. This posed security risks because:

1. **Row Level Security (RLS)**: Regular users shouldn't have permission to query admin user data
2. **Data Exposure**: Direct table access could potentially expose sensitive user information
3. **Permission Escalation**: Users could potentially access admin information they shouldn't see

### Solution
We implemented a secure database function approach:

#### 1. Database Function (`get_active_admin_emails`)
```sql
CREATE OR REPLACE FUNCTION get_active_admin_emails()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

**Key Security Features:**
- **SECURITY DEFINER**: Function runs with the privileges of the function owner (database admin), not the caller
- **Limited Scope**: Only returns email addresses, no other sensitive data
- **Filtered Results**: Only returns active admin users (sub_admin, super_admin roles)
- **Controlled Access**: Granted execute permission only to authenticated users and service role

#### 2. Email Service Implementation
- Uses `supabase.rpc('get_active_admin_emails')` instead of direct table queries
- Includes fallback to environment variables if database query fails
- Proper error handling and logging

## Usage Flow

1. **Order Confirmation**: User confirms payment for wallet funding or service order
2. **Admin Email Fetch**: System calls `get_active_admin_emails()` database function
3. **Email Distribution**: 
   - First admin email becomes primary recipient (TO)
   - Additional admin emails are added as CC recipients
4. **Fallback**: If no admins found, uses environment variable `RESEND_ADMIN_EMAIL` or `ADMIN_EMAIL`

## Database Setup

To set up the function, run the SQL script:
```bash
# Execute in Supabase SQL Editor
database/create-get-admin-emails-function.sql
```

## Environment Variables

Fallback configuration:
```env
RESEND_ADMIN_EMAIL=admin@example.com  # Primary fallback
ADMIN_EMAIL=admin@example.com         # Secondary fallback
```

## Benefits

1. **Security**: No direct table access from application code
2. **Performance**: Single function call instead of complex queries
3. **Maintainability**: Centralized admin email logic
4. **Flexibility**: Easy to modify admin selection criteria in the database
5. **Audit Trail**: Database function calls can be logged and monitored

## Testing

Use the debug endpoint to test the functionality:
```bash
# Test with actual admin emails
GET /api/debug/test-email

# Test with custom email
POST /api/debug/test-email
{
  "testEmail": "test@example.com"
}
```