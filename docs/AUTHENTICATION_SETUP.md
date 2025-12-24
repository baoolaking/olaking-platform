# Authentication Setup Guide

This guide covers the authentication implementation in the Olaking platform.

## Table of Contents

1. [Overview](#overview)
2. [Registration Flow](#registration-flow)
3. [Login Flow](#login-flow)
4. [Middleware Protection](#middleware-protection)
5. [Testing Authentication](#testing-authentication)

## Overview

The authentication system uses **Supabase Auth** with custom user metadata stored in the `users` table. Users can register with email, username, full name, WhatsApp number, and password.

### Key Features

- ✅ Email-based authentication with Supabase Auth
- ✅ Custom user fields (username, whatsapp_no, full_name)
- ✅ Triple login method: username OR whatsapp_no OR email
- ✅ Protected routes with middleware
- ✅ Role-based access control (user, sub_admin, super_admin)
- ✅ Form validation with Zod
- ✅ Toast notifications for user feedback

## Registration Flow

### User Journey

1. User visits `/register`
2. Fills out registration form with:

   - Email (required, must be valid email)
   - Username (3-20 chars, alphanumeric + underscore only)
   - Full Name (minimum 2 characters)
   - WhatsApp Number (international format: +234...)
   - Password (min 8 chars, must contain uppercase, lowercase, and number)
   - Confirm Password (must match)

3. Form validation runs client-side
4. System checks for existing username/WhatsApp number
5. Creates auth user via `supabase.auth.signUp()`
6. User metadata stored in auth.users table
7. Database trigger creates record in `users` table
8. Email verification sent to user
9. Redirects to login page

### Implementation Details

**File:** [app/register/page.tsx](app/register/page.tsx)

```typescript
// Registration with custom metadata
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    data: {
      username: data.username,
      whatsapp_no: data.whatsapp_no,
      full_name: data.full_name,
    },
  },
});
```

**Validation Schema:** [lib/validations/auth.ts](lib/validations/auth.ts)

```typescript
export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    whatsapp_no: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid WhatsApp number"),
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

## Login Flow

### User Journey

1. User visits `/login`
2. Enters identifier (username, WhatsApp number, or email) and password
3. System determines if identifier is:
   - Email (contains @)
   - WhatsApp number (starts with +)
   - Username (neither of above)
4. If not email, looks up email from `users` table
5. Authenticates with email + password via `supabase.auth.signInWithPassword()`
6. Redirects to dashboard or originally requested page

### Implementation Details

**File:** [app/login/page.tsx](app/login/page.tsx)

```typescript
// Triple authentication: username OR whatsapp_no OR email
const isWhatsApp = data.identifier.startsWith("+");
let email = data.identifier;

// Look up email if not provided directly
if (!data.identifier.includes("@")) {
  const { data: userData } = await supabase
    .from("users")
    .select("email")
    .or(
      isWhatsApp
        ? `whatsapp_no.eq.${data.identifier}`
        : `username.eq.${data.identifier}`
    )
    .single();

  email = userData.email;
}

// Sign in with email and password
await supabase.auth.signInWithPassword({ email, password });
```

**Validation Schema:** [lib/validations/auth.ts](lib/validations/auth.ts)

```typescript
export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or WhatsApp number is required"),
  password: z.string().min(1, "Password is required"),
});
```

## Middleware Protection

### Protected Routes

The middleware protects routes that require authentication:

**Protected Paths:**

- `/dashboard` - User dashboard
- `/services` - Browse services
- `/orders` - Order management
- `/wallet` - Wallet operations

**Admin Paths:**

- `/admin/**` - Admin panel (requires sub_admin or super_admin role)

### Implementation

**File:** [middleware.ts](middleware.ts)

```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

**File:** [lib/supabase/middleware.ts](lib/supabase/middleware.ts)

The middleware:

1. Creates Supabase client with cookie handling
2. Gets authenticated user
3. Checks if accessing protected/admin route
4. Redirects to login if unauthenticated
5. Checks role for admin routes
6. Returns response with updated session cookies

### How It Works

```typescript
// Check if user is authenticated
const {
  data: { user },
} = await supabase.auth.getUser();

// Redirect to login if accessing protected route without auth
if (isProtectedPath && !user) {
  return NextResponse.redirect(new URL("/login", request.url));
}

// Check admin role for admin routes
if (isAdminPath && user) {
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["sub_admin", "super_admin"].includes(userData.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
```

## Testing Authentication

### 1. Set Up Supabase

Before testing, ensure you have:

1. Created a Supabase project
2. Run the database schema from [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
3. Updated `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Create Test User

**Via Registration Page:**

1. Navigate to `http://localhost:3000/register`
2. Fill out the registration form:
   ```
   Email: test@example.com
   Username: testuser
   Full Name: Test User
   WhatsApp: +2348012345678
   Password: Test1234
   ```
3. Click "Create Account"
4. Check email for verification link (if email confirmation is enabled)

**Via Supabase Dashboard:**

1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. After creating, manually insert into `users` table:

```sql
INSERT INTO users (id, email, username, whatsapp_no, full_name)
VALUES (
  'auth-user-uuid-here',
  'test@example.com',
  'testuser',
  '+2348012345678',
  'Test User'
);
```

### 3. Test Login

Try logging in with different identifiers:

**With Email:**

```
Identifier: test@example.com
Password: Test1234
```

**With Username:**

```
Identifier: testuser
Password: Test1234
```

**With WhatsApp Number:**

```
Identifier: +2348012345678
Password: Test1234
```

### 4. Test Protected Routes

1. Try accessing `/dashboard` without logging in → Should redirect to `/login`
2. Log in successfully → Should redirect to `/dashboard`
3. Try accessing `/admin` as regular user → Should redirect to `/dashboard`

### 5. Test Sign Out

1. Go to dashboard
2. Click "Sign Out" button
3. Should redirect to login page
4. Try accessing dashboard again → Should redirect to login

## Troubleshooting

### "Your project's URL and Key are required"

- Ensure `.env.local` exists and contains valid Supabase credentials
- Restart Next.js dev server after updating environment variables
- Check that variables are prefixed with `NEXT_PUBLIC_`

### "Username already taken"

- Username must be unique across all users
- Try a different username or check the database

### "Invalid login credentials"

- Verify email confirmation is not required (check Supabase Auth settings)
- Check that password meets requirements
- Ensure user exists in both `auth.users` and `users` tables

### "Email not confirmed"

- Go to Supabase Dashboard → Authentication → Settings
- Under "Auth Providers", disable "Confirm email" for testing
- Or check spam folder for verification email

### Database trigger not creating user record

Ensure the trigger is set up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, whatsapp_no, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'whatsapp_no',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Security Considerations

1. **Password Requirements:** Enforced via Zod schema (min 8 chars, mixed case, numbers)
2. **Unique Identifiers:** Username and WhatsApp number checked before registration
3. **Session Management:** Handled by Supabase with secure HTTP-only cookies
4. **Role-Based Access:** Admin routes protected by middleware checking user role
5. **Input Validation:** All forms validated with Zod schemas
6. **CSRF Protection:** Built into Next.js Server Actions

## Next Steps

After setting up authentication, you can:

1. **Implement Password Reset:** Add forgot password flow
2. **Email Templates:** Customize Supabase Auth email templates
3. **Social Login:** Add OAuth providers (Google, GitHub, etc.)
4. **Two-Factor Auth:** Implement 2FA for enhanced security
5. **User Profile:** Create profile edit page
6. **Admin User Management:** Build admin interface for user management
