-- Create profiles table for RouteWise users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  home_address text,
  home_lat decimal(10, 7),
  home_lng decimal(10, 7),
  vehicle_mpg integer DEFAULT 25,
  fuel_cost_per_gallon decimal(5, 2) DEFAULT 3.50,
  typical_start_time time DEFAULT '08:00:00',
  typical_end_time time DEFAULT '17:00:00',
  onboarding_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create companies lookup table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  default_inspection_minutes integer DEFAULT 30,
  requires_appointment boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS - companies are readable by all authenticated users
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view companies"
ON public.companies FOR SELECT
USING (auth.role() = 'authenticated');

-- Insert default companies
INSERT INTO public.companies (code, name, default_inspection_minutes, requires_appointment) VALUES
('MIL', 'Millennium Information Services', 30, false),
('IPI', 'Insurance Property Inspections', 30, false),
('SIG', 'SIG Insurance Inspections', 45, true);

-- Create user_companies junction table
CREATE TABLE public.user_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id),
  company_name text NOT NULL,
  avg_inspection_minutes integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Users can manage their own company associations
CREATE POLICY "Users can view own companies"
ON public.user_companies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies"
ON public.user_companies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies"
ON public.user_companies FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies"
ON public.user_companies FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.email
  );
  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger for profiles
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();