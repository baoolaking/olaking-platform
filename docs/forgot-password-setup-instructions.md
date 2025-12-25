# Forgot Password Setup Instructions

## 🔧 Supabase Configuration Required

To make the forgot password flow work properly, you need to configure a few things in your Supabase dashboard:

### 1. **Update Email Template**

1. Go to **Authentication → Email Templates** in your Supabase dashboard
2. Select **"Reset Password"** template
3. Replace the content with the template from `docs/email-templates/supabase-recovery-template.html`
4. **Save** the template

### 2. **Configure Redirect URLs**

1. Go to **Authentication → URL Configuration** in your Supabase dashboard
2. Add these URLs to the **Redirect URLs** list:
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/reset-password
   ```
3. **Save** the configuration

### 3. **Set Site URL**

1. In **Authentication → URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`

## 🔄 How the Flow Works

1. **User requests password reset** → `/api/auth/forgot-password`
2. **Supabase sends email** with `{{ .ConfirmationURL }}` that includes the token
3. **Auth confirmation** → `/auth/confirm` verifies the token and redirects to `/reset-password`
4. **Password reset** → User enters new password on `/reset-password`
5. **Success** → User is signed out and redirected to login

## 🧪 Testing Steps

1. **Update the email template** in Supabase with the new template
2. **Add redirect URLs** to Supabase configuration
3. **Request password reset** using an existing user's email/username/WhatsApp
4. **Check email** for the reset link
5. **Click the link** - should redirect to reset password page
6. **Enter new password** and submit
7. **Verify** you can login with the new password

## 🐛 Current Issue

The error "Email link is invalid or has expired" suggests that:
1. The email template might not be updated in Supabase
2. The redirect URLs might not be configured properly
3. The `{{ .ConfirmationURL }}` variable is not being processed correctly

## 📝 Next Steps

1. **Update the Supabase email template** with the content from `supabase-recovery-template.html`
2. **Ensure redirect URLs are added** to Supabase dashboard
3. **Test with a fresh password reset request**

The key is that Supabase's `{{ .ConfirmationURL }}` automatically includes the proper token format that our `/auth/confirm` route expects.