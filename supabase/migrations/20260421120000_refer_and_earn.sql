-- Refer & Earn: referral codes, points, wallet credit, audit tables

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_points INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_points_redeemed INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_wallet_balance_inr NUMERIC(10, 2) NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_unique_idx
  ON public.profiles (referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_referred_by_idx
  ON public.profiles (referred_by);

CREATE TABLE IF NOT EXISTS public.referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'signup',
  points_awarded INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT referral_events_referred_user_unique UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS referral_events_referrer_id_idx
  ON public.referral_events (referrer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.referral_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  points_used INT NOT NULL DEFAULT 500,
  amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_redemptions_user_id_idx
  ON public.referral_redemptions (user_id, created_at DESC);

COMMENT ON COLUMN public.profiles.referral_points IS 'Total referral points earned (50 per successful signup).';
COMMENT ON COLUMN public.profiles.referral_points_redeemed IS 'Points spent on redemptions.';
COMMENT ON COLUMN public.profiles.referral_wallet_balance_inr IS 'INR credit from redeeming referral points (usable on subscriptions).';

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;
