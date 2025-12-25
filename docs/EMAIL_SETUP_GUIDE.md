# Email Setup Guide - Resend Integration

## 🎯 **The Issue**
Admin emails are not being sent because the email service needs to be properly configured with your Resend API key.

## 🔧 **Quick Fix Steps**

### Step 1: Check Environment Variables
Make sure these are set in your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_ADMIN_EMAIL=admin@yourdomain.com
```

### Step 2: Test Email Configuration
Visit this URL to check your email config:
```
GET /api/debug/test-email
```

Expected response:
```json
{
  "configured": {
    "resendApiKey": true,
    "adminEmail": true,
    "fromEmail": true
  },
  "values": {
    "adminEmail": "admin@yourdomain.com",
    "fromEmail": "noreply@yourdomain.com",
    "apiKeyLength": 32
  }
}
```

### Step 3: Test Email Sending
```bash
curl -X POST http://localhost:3000/api/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@example.com"}'
```

## 🚀 **Updated Email Service**

I've updated the email service to:
- ✅ Use Resend API instead of console logging
- ✅ Automatically detect if Resend API key is available
- ✅ Proper error handling and logging
- ✅ Production-ready email templates

## 📧 **Resend Setup Requirements**

### 1. Domain Verification
- Add your domain to Resend
- Verify DNS records
- Use verified domain in `RESEND_FROM_EMAIL`

### 2. API Key
- Get API key from Resend dashboard
- Add to `RESEND_API_KEY` environment variable

### 3. From Email Format
```bash
# Good examples:
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_EMAIL=notifications@yourdomain.com

# Bad examples (will be rejected):
RESEND_FROM_EMAIL=noreply@gmail.com
RESEND_FROM_EMAIL=test@example.com
```

## 🧪 **Testing Steps**

### 1. Check Configuration
```bash
curl http://localhost:3000/api/debug/test-email
```

### 2. Send Test Email
```bash
curl -X POST http://localhost:3000/api/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "admin@yourdomain.com"}'
```

### 3. Test Real Flow
1. Create wallet funding order
2. Click "I've sent the money"
3. Check admin email inbox
4. Should receive formatted notification

## 🔍 **Troubleshooting**

### Issue: "API key not found"
**Solution**: Add `RESEND_API_KEY` to `.env.local`

### Issue: "Domain not verified"
**Solution**: Verify your domain in Resend dashboard

### Issue: "From email rejected"
**Solution**: Use email address from verified domain

### Issue: "Email not received"
**Check**:
1. Spam folder
2. Admin email address is correct
3. Resend dashboard for delivery status

## 🎯 **Expected Behavior After Fix**

1. ✅ Environment variables configured
2. ✅ Test email endpoint works
3. ✅ Real wallet funding emails sent
4. ✅ Admin receives formatted notifications
5. ✅ Server logs show "Email sent successfully via Resend"

## 📋 **Quick Checklist**

- [ ] `RESEND_API_KEY` set in `.env.local`
- [ ] `RESEND_FROM_EMAIL` set with verified domain
- [ ] `RESEND_ADMIN_EMAIL` set with correct admin email
- [ ] Domain verified in Resend dashboard
- [ ] Test email endpoint returns success
- [ ] Real wallet funding flow sends email

After completing these steps, admin emails should work perfectly! 🚀