# Olaking - TikTok Boosting Platform

A comprehensive social media boosting platform built with Next.js 15, Supabase, and TypeScript.

## 🚀 Features

- **Social Media Boosting Services** - TikTok followers, likes, views, and more
- **External Services** - UK Accounts, PayPal, TikTok Coins, Phone Numbers (WhatsApp redirect)
- **User Authentication** - Register with email, username, WhatsApp, and password
- **Triple Login System** - Login with username, WhatsApp number, or email
- **Wallet System** - Fund wallet, automatic deductions, transaction history
- **Order Management** - Create orders, track status, view history
- **Admin Panel** - Verify payments, manage services, view audit logs
- **Role-Based Access** - User, Sub Admin, Super Admin roles
- **Email Notifications** - Order updates via Resend
- **Dark Mode** - Built-in light/dark theme toggle

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS 4.1.18
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Email:** Resend
- **UI Components:** Shadcn/ui
- **Animations:** Framer Motion 12.23.26
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

## 📋 Prerequisites

- Node.js 18+ (recommended: v20 or later)
- pnpm (recommended) or npm
- Supabase account
- Resend account (optional, for email notifications)

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Olaking
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
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

# Resend Email Configuration (Optional)
RESEND_API_KEY=your_resend_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_UK_ACCOUNT=+234XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_PAYPAL=+234XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_TIKTOK_COINS=+234XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_NUMBERS=+234XXXXXXXXXX
```

See [ENV_VARIABLES.md](docs/ENV_VARIABLES.md) for detailed configuration.

### 4. Set Up Supabase Database

Follow the complete guide in [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md):

1. Create a new Supabase project
2. Run the SQL migrations (tables, enums, RLS policies, functions)
3. Set up database triggers
4. Configure authentication settings
5. Set up Edge Functions
6. Generate TypeScript types

### 5. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

- [Environment Variables Setup](docs/ENV_VARIABLES.md)
- [Supabase Database Setup](docs/SUPABASE_SETUP.md)
- [Authentication Setup](docs/AUTHENTICATION_SETUP.md)

## 🏗️ Project Structure

```
Olaking/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # User dashboard
│   │   └── layout.tsx        # Dashboard layout with auth check
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── services/             # Services browsing
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles & Tailwind config
├── components/
│   ├── ui/                   # Shadcn/ui components
│   ├── theme-provider.tsx    # Theme context provider
│   └── theme-toggle.tsx      # Dark mode toggle
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Client-side Supabase client
│   │   ├── server.ts         # Server-side Supabase client
│   │   └── middleware.ts     # Auth middleware helper
│   └── validations/
│       └── auth.ts           # Zod validation schemas
├── docs/
│   ├── ENV_VARIABLES.md      # Environment variables guide
│   ├── SUPABASE_SETUP.md     # Database setup guide
│   └── AUTHENTICATION_SETUP.md # Auth implementation guide
├── middleware.ts             # Route protection middleware
├── .env.local.example        # Environment variables template
└── package.json              # Project dependencies
```

## 🎨 Key Features Explained

### Authentication

The platform supports a unique triple authentication system:

- **Register:** Email, Username, Full Name, WhatsApp Number, Password
- **Login:** Use any of: Username, WhatsApp Number, or Email + Password
- **Protected Routes:** Middleware automatically protects authenticated routes
- **Role-Based Access:** Different permissions for users, sub-admins, and super-admins

See [AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md) for detailed implementation.

### Landing Page

The animated landing page features:

- **5 Objectives Section:**
  - Social Media Boosting (internal service)
  - UK Accounts, PayPal, TikTok Coins, Phone Numbers (WhatsApp redirect)
- **Platform Showcase:** TikTok, Instagram, Facebook, Twitter, YouTube, Telegram
- **Feature Highlights:** Fast delivery, secure payments, 24/7 support, real results
- **Stats Counter:** Orders processed, active clients, success rate
- **Framer Motion Animations:** Smooth page transitions and floating elements

### User Dashboard

Once authenticated, users see:

- **Wallet Balance:** Current balance with fund wallet link
- **Order Statistics:** Total orders and pending orders count
- **Quick Actions:** Browse services, view orders
- **Account Information:** Email, username, WhatsApp, role

### Database Schema

The platform uses Supabase PostgreSQL with:

- **8 Core Tables:** users, services, orders, bank_accounts, admin_settings, wallet_transactions, admin_audit_logs
- **Type-Safe Enums:** user_role, order_status, transaction_type, quality_type, payment_method, platform_enum
- **Row Level Security (RLS):** Policies for all tables with role-based access
- **Database Functions:** Wallet operations, audit logging, auto-cancellation
- **Triggers:** Automatic timestamp updates, user creation from auth

See [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for complete schema.

## 🔐 Security Features

- **Password Requirements:** Minimum 8 characters, mixed case, numbers
- **Unique Identifiers:** Username and WhatsApp number uniqueness enforced
- **Session Management:** Secure HTTP-only cookies via Supabase
- **CSRF Protection:** Built into Next.js Server Actions
- **Input Validation:** All forms validated with Zod schemas
- **Row Level Security:** Database-level access control
- **Admin Audit Logs:** Track all admin actions

## 🚧 Coming Soon

- [ ] Wallet funding flow with bank account selection
- [ ] Services browsing and order creation
- [ ] Payment verification for admins
- [ ] Order status updates
- [ ] Email notifications via Resend
- [ ] Admin panel for service management
- [ ] User profile edit page
- [ ] Password reset flow
- [ ] Transaction history page
- [ ] Order history with filters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential. All rights reserved by BAO OLAKING GLOBAL ENTERPRISES.

## 📧 Support

For support, contact the development team or refer to the documentation in the `docs/` folder.

---

Built with ❤️ by the Olaking Team
