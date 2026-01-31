-- =====================================================
-- ORDERS TABLE - Quản lý đơn hàng
-- =====================================================

-- Create enum for order status
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
  
  -- Order details
  order_code TEXT UNIQUE NOT NULL, -- Mã đơn hàng: NAPTEN + userId prefix + random
  amount DECIMAL(12, 0) NOT NULL,
  currency TEXT DEFAULT 'VND',
  status order_status DEFAULT 'pending',
  
  -- Payment info
  payment_method TEXT DEFAULT 'bank_transfer',
  transaction_id TEXT, -- Mã giao dịch từ ngân hàng
  bank_name TEXT,
  paid_at TIMESTAMPTZ,
  
  -- User info at time of order
  user_email TEXT,
  user_name TEXT,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') -- Order expires after 24h
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "orders_select_own" ON public.orders 
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own orders
CREATE POLICY "orders_insert_own" ON public.orders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do everything (for webhooks)
CREATE POLICY "orders_service_role" ON public.orders 
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_orders_updated ON public.orders;
CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- USER SUBSCRIPTIONS TABLE - Gói dịch vụ của user
-- =====================================================

-- Create enum for subscription status
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  
  -- Subscription details
  status subscription_status DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = lifetime
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER, -- NULL = unlimited
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_package_id ON public.user_subscriptions(package_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "subscriptions_select_own" ON public.user_subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can do everything
CREATE POLICY "subscriptions_service_role" ON public.user_subscriptions 
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_user_subscriptions_updated ON public.user_subscriptions;
CREATE TRIGGER on_user_subscriptions_updated
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- BANK ACCOUNT CONFIG TABLE - Thông tin tài khoản ngân hàng
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  branch TEXT,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active bank accounts
CREATE POLICY "bank_accounts_select_public" ON public.bank_accounts 
  FOR SELECT USING (is_active = true);

-- Policy: Service role can manage
CREATE POLICY "bank_accounts_service_role" ON public.bank_accounts 
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default Timo account (you should update this with real info)
INSERT INTO public.bank_accounts (bank_name, account_number, account_holder, is_active, is_primary)
VALUES ('Timo', '1055116973', 'LUONG VAN HOC', true, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTION: Generate order code
-- =====================================================

CREATE OR REPLACE FUNCTION generate_order_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_random TEXT;
BEGIN
  -- Get first 8 chars of user_id (without hyphens)
  v_prefix := UPPER(REPLACE(p_user_id::TEXT, '-', ''));
  v_prefix := SUBSTRING(v_prefix FROM 1 FOR 8);
  
  -- Generate 4 random alphanumeric chars
  v_random := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
  
  RETURN 'NAPTEN' || v_prefix || v_random;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Activate subscription after payment
-- =====================================================

CREATE OR REPLACE FUNCTION activate_subscription(
  p_order_id UUID,
  p_transaction_id TEXT,
  p_bank_name TEXT DEFAULT 'Timo'
)
RETURNS UUID AS $$
DECLARE
  v_order RECORD;
  v_subscription_id UUID;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF v_order.status = 'paid' THEN
    RAISE EXCEPTION 'Order already paid';
  END IF;
  
  -- Update order status
  UPDATE public.orders SET
    status = 'paid',
    transaction_id = p_transaction_id,
    bank_name = p_bank_name,
    paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Create subscription (lifetime for now)
  INSERT INTO public.user_subscriptions (user_id, package_id, order_id, status, started_at)
  VALUES (v_order.user_id, v_order.package_id, p_order_id, 'active', NOW())
  RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
