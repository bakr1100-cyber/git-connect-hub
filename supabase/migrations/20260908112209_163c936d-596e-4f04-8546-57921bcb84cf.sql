ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_tier_check;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_tier_check CHECK (tier IN ('standard','premium','unlimited6','unlimited12'));

ALTER TABLE public.user_entitlements DROP CONSTRAINT IF EXISTS user_entitlements_tier_check;
ALTER TABLE public.user_entitlements ADD CONSTRAINT user_entitlements_tier_check CHECK (tier IN ('free','standard','premium','unlimited6','unlimited12'));

CREATE OR REPLACE FUNCTION public.ai_quota_for_tier(_tier text)
RETURNS TABLE(max_calls integer, max_cost numeric)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  select case _tier
           when 'unlimited12' then 200
           when 'unlimited6' then 150
           when 'premium' then 60
           when 'standard' then 20
           else 3 end,
         case _tier
           when 'unlimited12' then 100.0
           when 'unlimited6' then 75.0
           when 'premium' then 30.0
           when 'standard' then 10.0
           else 1.5 end;
$$;