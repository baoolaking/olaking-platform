# Forgot Password Flow Documentation

## Overview
The forgot password feature allows users to reset their password when they can't remember it. The flow supports lookup by username, email, or WhatsApp number.

## User Flow

### 1. Initiate Password Reset
- User clicks "Forgot password?" link on the login page
- User enters their username, email, or WhatsApp number
- System looks up the user and sends a password reset email to their registered email address

### 2. Email Verification
- User receives an email with a password reset link
- The link contains access and refresh tokens for authentication
- Link redirects to `/reset-password` page

### 3. Password Reset
- User enters their new password (with confirmation)
- System validates the new password meets security requirements
- Password is updated in Supabase Auth
- User is signed out and redirected to login page

## Technical Implementation

### API Endpoints
- `POST /api/auth/forgot-password` - Initiates password reset
- Uses Supabase's built-in `resetPasswordForEmail` function

### Pages
- `/login` - Contains forgot password form (toggled view)
- `/reset-password` - Password reset form with token validation

### Security Features
- User lookup supports multiple identifiers (username, email, WhatsApp)
- Inactive accounts are rejected
- Generic success message prevents user enumeration
- Password requirements enforced (8+ chars, uppercase, lowercase, number)
- Automatic session cleanup after password reset

### Email Service
- Uses Resend API for custom notifications (optional)
- Falls back to console logging in development
- Supabase handles the actual reset email with secure tokens

## Environment Variables Required
- `NEXT_PUBLIC_APP_URL` - Used for reset link redirect URL
- `RESEND_API_KEY` - Optional, for custom email notifications

## Error Handling
- Invalid/expired reset links redirect to login
- Network errors show user-friendly messages
- Server errors are logged but don't expose sensitive information

## Testing
Use the test file at `app/login/test-forgot-password.ts` to manually test the API endpoint.