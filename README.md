# Olaking - Social Media Boosting Platform

A comprehensive social media boosting platform built with Next.js 16, Supabase, and TypeScript. Manage TikTok services, wallet transactions, and orders with a powerful admin panel.

## 🚀 Features

### User Features
- **Social Media Boosting Services** - TikTok followers, likes, views, and more
- **TikTok Coins** - Purchase TikTok coins with dynamic pricing via WhatsApp
- **External Services** - UK Accounts, PayPal, Phone Numbers (WhatsApp redirect)
- **Triple Login System** - Login with username, WhatsApp number, or email
- **International Phone Support** - Accept phone numbers from any country (E.164 format)
- **Wallet System** - Fund wallet, automatic deductions, transaction history
- **Order Management** - Create orders, track status, view history
- **Dark Mode** - Built-in light/dark theme toggle

### Admin Features
- **Admin Dashboard** - Overview with stats (users, orders, revenue, wallet balances)
- **User Management** - View, create, edit, and deactivate users
- **Order Management** - Verify payments, update status, assign orders
- **Service Management** - Create and manage social media services
- **TikTok Packages** - Dynamic pricing management for TikTok coin packages
- **Bank Accounts** - Manage payment bank accounts
- **Wallet Operations** - Credit/debit user wallets
- **Audit Logs** - Track all admin actions
- **Role-Based Access** - User, Sub Admin, Super Admin roles

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.1 (App Router with Turbopack)
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS 4.1.18
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Email:** Resend
- **UI Components:** Shadcn/ui
- **Animations:** Framer Motion 12.23.26
- **Forms:** React Hook Form + Zod validation
- **Phone Validation:** libphonenumber-js
- **Icons:** Lucide React
- **Notifications:** Sonner

## 📋 Prerequisites

- Node.js 18+ (recommended: v20 or later)
- pnpm (recommended) or npm
- Supabase account
- Resend account (for email notifications)

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Olaking
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_UK_ACCOUNT=+234XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_PAYPAL=+234XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_TIKTOK_COINS=+234XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_NUMBERS=+234XXXXXXXXXX
```

### 4. Set Up Supabase Database

1. Create a new Supabase project
2. Run the SQL migrations in order:
   - `database/migrations/*.sql` - Core tables and enums
   - `database/migrations/create_tiktok_coin_packages.sql` - TikTok packages table
3. Run seed data:
   - `database/seeds/01_seed_bank_accounts.sql`
   - `database/seeds/02_seed_platform_data.sql`
4. Configure RLS policies (included in migrations)

### 5. Create Admin User

Navigate to `/seed-admin` and create your first super admin account.

### 6. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
Olaking/
├── app/
│   ├── (dashboard)/          # Protected user dashboard routes
│   ├── admin/                # Admin panel routes
│   │   ├── orders/           # Order management
│   │   ├── users/            # User management
│   │   ├── services/         # Service management
│   │   ├── tiktok-packages/  # TikTok coin packages
│   │   ├── bank-accounts/    # Bank account management
│   │   └── settings/         # Admin settings
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication routes
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   └── page.tsx              # Landing page
├── components/
│   ├── admin/                # Admin-specific components
│   ├── common/               # Shared components
│   ├── dashboard/            # User dashboard components
│   ├── sections/             # Landing page sections
│   └── ui/                   # Shadcn/ui components
├── lib/
│   ├── supabase/             # Supabase clients
│   ├── config/               # Configuration files
│   ├── utils/                # Utility functions
│   └── validations/          # Zod schemas
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
├── database/
│   ├── migrations/           # SQL migrations
│   └── seeds/                # Seed data
└── middleware.ts             # Route protection
```

## 🎨 Key Features

### International Phone Support

- Accepts phone numbers from any country
- Validates using libphonenumber-js
- Stores in E.164 format for WhatsApp compatibility
- Smart input with country code detection

### TikTok Coin Packages

- Admin-managed dynamic pricing
- 6 default packages (200, 500, 1000, 1500, 5000, 10000 coins)
- Popular package highlighting
- Mobile-optimized selection modal
- WhatsApp integration with package details

### Wallet System

- Real-time balance tracking
- Credit/debit operations
- Transaction history
- Admin wallet management
- Automatic order deductions

### Order Management

- Multi-status workflow (awaiting_payment, pending, completed, etc.)
- Payment verification by admins
- Order assignment system
- WhatsApp notifications
- Status-based filtering

### Admin Dashboard

- Total users, orders, revenue stats
- Total wallet balance across all users
- Recent orders with clickable navigation
- Pending actions overview
- Color-coded status badges

## 🔐 Security Features

- **Password Requirements:** Minimum 8 characters, mixed case, numbers
- **Unique Identifiers:** Username and WhatsApp number uniqueness
- **Session Management:** Secure HTTP-only cookies
- **Input Validation:** Zod schemas for all forms
- **Row Level Security:** Database-level access control
- **Admin Audit Logs:** Track all admin actions
- **Role-Based Permissions:** Granular access control

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment, especially:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## 📝 License

This project is proprietary and confidential. All rights reserved by BAO OLAKING GLOBAL ENTERPRISES.

## 📧 Support

For support, contact the development team.

---

Built with ❤️ by the Olaking Team
