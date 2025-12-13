-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');

-- Create user_roles table (per security requirements - NOT on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_app_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add subscription columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_trial_days')),
  discount_value NUMERIC NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  applicable_tiers TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes FOR ALL
TO authenticated
USING (is_app_admin(auth.uid()));

-- Create referral_credits table
CREATE TABLE public.referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) NOT NULL,
  credit_type TEXT NOT NULL CHECK (credit_type IN ('free_weeks', 'cash')),
  credit_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'paid_out')),
  created_at TIMESTAMPTZ DEFAULT now(),
  applied_at TIMESTAMPTZ,
  paid_out_at TIMESTAMPTZ
);

ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage referral credits"
ON public.referral_credits FOR ALL
TO authenticated
USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can view own referral credits"
ON public.referral_credits FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create subscription_events table
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'upgraded', 'downgraded', 'canceled', 'renewed', 'refunded', 'trial_extended')),
  from_status TEXT,
  to_status TEXT,
  from_tier TEXT,
  to_tier TEXT,
  amount NUMERIC,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage subscription events"
ON public.subscription_events FOR ALL
TO authenticated
USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can view own subscription events"
ON public.subscription_events FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin RLS policy for profiles (admins can view all)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (is_app_admin(auth.uid()));