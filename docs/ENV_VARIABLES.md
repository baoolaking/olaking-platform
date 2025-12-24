# Environment Variables

This file contains all the environment variables needed for the BAO OLAKING platform.

## Required Variables

### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get these:**

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the Project URL and anon/service_role keys

### Resend Email Service

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@olaking.com
RESEND_ADMIN_EMAIL=admin@olaking.com
```

**How to get these:**

1. Go to [https://resend.com](https://resend.com)
2. Sign up and verify your domain
3. Generate an API key from the dashboard

### Application Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER_1=+2349017992518
NEXT_PUBLIC_WHATSAPP_NUMBER_2=+2349163313727
```

**Note:** In production, update `NEXT_PUBLIC_APP_URL` to your actual domain.

## Optional Variables

### Analytics (Optional)

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Feature Flags

```env
NEXT_PUBLIC_ENABLE_REALTIME_ORDERS=true
NEXT_PUBLIC_POLLING_INTERVAL=60000
```

## Environment Files

### Development (.env.local)

Create a `.env.local` file in the root directory with all the variables above.

```bash
# Example .env.local
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER_1=+2349017992518
NEXT_PUBLIC_WHATSAPP_NUMBER_2=+2349163313727
```

### Production (Vercel)

For production deployment on Vercel:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add all the variables listed above
4. Update `NEXT_PUBLIC_APP_URL` to your production URL

## Security Notes

- ⚠️ **NEVER** commit `.env.local` to version control
- Use `.env.local.example` (without actual values) for reference
- Rotate API keys regularly for security
- Service role key should only be used in secure server environments
- Keep your Resend API key private

## Example File

Copy `.env.local.example` to `.env.local` and fill in your actual values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual credentials.
