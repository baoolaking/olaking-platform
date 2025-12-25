# Supabase Setup Guide

Complete guide for setting up the Supabase backend for BAO OLAKING platform.

## Table of Contents

1. [Create Supabase Project](#1-create-supabase-project)
2. [Database Schema Setup](#2-database-schema-setup)
3. [Row Level Security (RLS) Policies](#3-row-level-security-policies)
4. [Database Functions](#4-database-functions)
5. [Database Triggers](#5-database-triggers)
6. [Edge Functions Setup](#6-edge-functions-setup)
7. [Authentication Configuration](#7-authentication-configuration)
8. [Database Webhooks](#8-database-webhooks)

---

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name:** olaking-platform
   - **Database Password:** (Generate strong password)
   - **Region:** Choose closest to your users
5. Wait for project to be provisioned (~2 minutes)
6. Go to Settings → API and note down:
   - Project URL
   - `anon` public key
   - `service_role` secret key

---

## 2. Database Schema Setup

### Step 1: Enable UUID Extension

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 2: Create Enums

```sql
-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'sub_admin', 'super_admin');

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'awaiting_payment',
  'pending',
  'completed',
  'failed',
  'awaiting_refund',
  'refunded'
);

-- Transaction type enum
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'refund');

-- Quality type enum
CREATE TYPE quality_type AS ENUM ('high_quality', 'low_quality');

-- Payment method enum
CREATE TYPE payment_method AS ENUM ('wallet', 'bank_transfer');

-- Platform enum
CREATE TYPE platform_enum AS ENUM (
  'tiktok',
  'instagram',
  'facebook',
  'youtube',
  'x',
  'whatsapp',
  'telegram'
);

-- Service type enums (as TEXT for flexibility)
-- We'll validate these at application level for each platform
```

### Step 3: Create Tables

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  whatsapp_no TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  wallet_balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (wallet_balance >= 0),
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_whatsapp ON users(whatsapp_no);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

#### Services Table

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform platform_enum NOT NULL,
  service_type TEXT NOT NULL,
  price_per_1k NUMERIC(10, 2) NOT NULL CHECK (price_per_1k > 0),
  is_active BOOLEAN DEFAULT TRUE,
  min_quantity INTEGER DEFAULT 100 CHECK (min_quantity > 0),
  max_quantity INTEGER DEFAULT 500000 CHECK (max_quantity >= min_quantity),
  delivery_time TEXT DEFAULT '24-48 hours',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, service_type)
);

-- Indexes
CREATE INDEX idx_services_platform ON services(platform);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_platform_active ON services(platform, is_active);
```

#### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT, -- NULL for wallet funding
  quantity INTEGER NOT NULL CHECK (quantity >= 100 AND quantity <= 500000),
  price_per_1k NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price > 0),
  status order_status NOT NULL DEFAULT 'awaiting_payment',
  link TEXT NOT NULL,
  quality_type quality_type NOT NULL,
  payment_method payment_method NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id),
  payment_verified_at TIMESTAMPTZ,
  payment_verified_by UUID REFERENCES users(id),
  admin_notes TEXT,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint to ensure service_id is provided for service orders, NULL for wallet funding
  CONSTRAINT orders_service_or_wallet_funding_check 
    CHECK (
      (service_id IS NOT NULL AND link != 'wallet_funding') OR 
      (service_id IS NULL AND link = 'wallet_funding')
    )
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_service_id ON orders(service_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_method ON orders(payment_method);
CREATE INDEX idx_orders_awaiting_payment ON orders(status) WHERE status = 'awaiting_payment';
```

#### Bank Accounts Table

```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_number, bank_name)
);

-- Index
CREATE INDEX idx_bank_accounts_active ON bank_accounts(is_active, sort_order);
```

#### Admin Settings Table

```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate with default settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
  ('min_wallet_funding', '500', 'Minimum amount in NGN for wallet funding'),
  ('whatsapp_contact_1', '+234 901 799 2518', 'Primary WhatsApp support number'),
  ('whatsapp_contact_2', '+234 916 331 3727', 'Secondary WhatsApp support number'),
  ('platform_name', 'BAO OLAKING GLOBAL ENTERPRISES', 'Platform name'),
  ('primary_color', '#49F656', 'Primary brand color'),
  ('order_timeout_hours', '24', 'Hours before auto-cancelling unpaid orders');
```

#### Wallet Transactions Table

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  balance_before NUMERIC(10, 2) NOT NULL,
  balance_after NUMERIC(10, 2) NOT NULL,
  reference TEXT,
  description TEXT,
  order_id UUID REFERENCES orders(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_order_id ON wallet_transactions(order_id);
```

#### Admin Audit Logs Table

```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
```

---

## 3. Row Level Security (RLS) Policies

Enable RLS on all tables and create policies:

### Enable RLS

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
```

### Users Table Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (excluding role and wallet_balance)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM users WHERE id = auth.uid()) AND
    wallet_balance = (SELECT wallet_balance FROM users WHERE id = auth.uid())
  );

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('sub_admin', 'super_admin')
    )
  );

-- Super admins can manage users
CREATE POLICY "Super admins can manage users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
```

### Services Table Policies

```sql
-- Everyone can view active services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (
    is_active = TRUE OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('sub_admin', 'super_admin')
    )
  );

-- Only super admins can manage services
CREATE POLICY "Super admins manage services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
```

### Orders Table Policies

```sql
-- Users can view their own orders
CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own orders
CREATE POLICY "Users create own orders"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('sub_admin', 'super_admin')
    )
  );

-- Admins can update orders
CREATE POLICY "Admins update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('sub_admin', 'super_admin')
    )
  );
```

### Bank Accounts Table Policies

```sql
-- Users can view active bank accounts
CREATE POLICY "Users view active bank accounts"
  ON bank_accounts FOR SELECT
  USING (
    is_active = TRUE OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('sub_admin', 'super_admin')
    )
  );

-- Only super admins can manage bank accounts
CREATE POLICY "Super admins manage bank accounts"
  ON bank_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
```

### Admin Settings Policies

```sql
-- Everyone can read settings
CREATE POLICY "Anyone can read settings"
  ON admin_settings FOR SELECT
  USING (TRUE);

-- Only super admins can update settings
CREATE POLICY "Super admins update settings"
  ON admin_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
```

### Wallet Transactions Policies

```sql
-- Users can view their own transactions
CREATE POLICY "Users view own transactions"
  ON wallet_transactions FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all transactions
CREATE POLICY "Admins view all transactions"
  ON wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('sub_admin', 'super_admin')
    )
  );
```

### Admin Audit Logs Policies

```sql
-- Only super admins can view audit logs
CREATE POLICY "Super admins view audit logs"
  ON admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
```

---

## 4. Database Functions

### Update Timestamp Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Wallet Deduction Function

```sql
CREATE OR REPLACE FUNCTION deduct_from_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_order_id UUID,
  p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get current balance with row lock
  SELECT wallet_balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update user balance
  UPDATE users
  SET wallet_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO wallet_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    order_id,
    description
  ) VALUES (
    p_user_id,
    'debit',
    p_amount,
    v_current_balance,
    v_new_balance,
    p_order_id,
    p_description
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Credit Wallet Function

```sql
CREATE OR REPLACE FUNCTION credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_order_id UUID DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get current balance with row lock
  SELECT wallet_balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Update user balance
  UPDATE users
  SET wallet_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO wallet_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    order_id,
    description,
    created_by
  ) VALUES (
    p_user_id,
    'credit',
    p_amount,
    v_current_balance,
    v_new_balance,
    p_order_id,
    p_description,
    p_created_by
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Log Admin Action Function

```sql
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    p_admin_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Database Triggers

Apply update_updated_at trigger to relevant tables:

```sql
-- Users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Services table
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Orders table
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Bank accounts table
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Admin settings table
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 6. Edge Functions Setup

### Install Supabase CLI

```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

### Create Edge Functions

```bash
# Create email notification function
supabase functions new send-order-notification

# Create auto-cancel function
supabase functions new auto-cancel-orders
```

### Set Environment Variables

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
```

### Deploy Functions

```bash
supabase functions deploy send-order-notification
supabase functions deploy auto-cancel-orders
```

Edge function code will be in the main project.

---

## 7. Authentication Configuration

1. Go to Authentication → Settings in Supabase Dashboard
2. Configure:
   - **Email Confirmations:** Disabled (or enabled based on preference)
   - **JWT Expiry:** 3600 seconds (1 hour)
   - **Refresh Token Expiry:** 604800 seconds (7 days)
3. Email Templates:
   - Customize confirmation and password reset templates
4. Providers:
   - Enable Email provider (for now)
   - Optional: Add social providers later

---

## 8. Database Webhooks

1. Go to Database → Webhooks in Supabase Dashboard
2. Create webhook for orders table:
   - **Name:** order-notifications
   - **Table:** orders
   - **Events:** INSERT, UPDATE
   - **Type:** HTTP Request
   - **Method:** POST
   - **URL:** Your Edge Function URL
   - **HTTP Headers:**
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     ```

---

## 9. Testing the Setup

### Test Database Connection

```sql
-- Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check enums
SELECT typname
FROM pg_type
WHERE typtype = 'e';

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Test Wallet Function

```sql
-- Create a test user first, then:
SELECT deduct_from_wallet(
  'user-uuid-here'::UUID,
  1000.00,
  'order-uuid-here'::UUID,
  'Test order payment'
);
```

---

## 10. Generate TypeScript Types

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Generate types
supabase gen types typescript --local > types/database.ts
```

Or if using remote:

```bash
supabase gen types typescript --project-id your-project-ref > types/database.ts
```

---

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working:**

   - Ensure you're using service role key for admin operations
   - Check if auth.uid() returns correct user ID

2. **Functions Failing:**

   - Check function syntax in SQL editor
   - Verify all referenced tables exist
   - Check for circular dependencies

3. **Edge Functions Not Deploying:**

   - Ensure Supabase CLI is updated
   - Check project link with `supabase projects list`
   - Verify secrets are set correctly

4. **Type Generation Issues:**
   - Make sure all migrations are applied
   - Use `--local` flag if testing locally
   - Check your project-id is correct

---

## Next Steps

1. ✅ Create `.env.local` with your Supabase credentials
2. ✅ Run all SQL scripts in Supabase SQL Editor
3. ✅ Deploy Edge Functions
4. ✅ Set up webhooks
5. ✅ Generate TypeScript types
6. Start building the application!

For issues or questions, check [Supabase Documentation](https://supabase.com/docs) or contact support.
