-- Add subscription_tier column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'individual';

-- Update Russ's profile to Lifetime tier
UPDATE public.profiles 
SET subscription_status = 'active', subscription_tier = 'lifetime' 
WHERE id = '46305f09-c8c3-44a2-aa3d-16669503a8cd';