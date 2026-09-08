CREATE TABLE public.packages (
  tier text PRIMARY KEY,
  name text NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  days integer NOT NULL,
  price_id text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.packages TO anon, authenticated;
GRANT ALL ON public.packages TO service_role;

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active packages"
  ON public.packages FOR SELECT TO anon, authenticated
  USING (is_active);

CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.packages (tier, name, amount_cents, currency, days, price_id, sort_order, is_popular) VALUES
  ('standard', 'Einzel-Export', 990, 'EUR', 30, 'cv_standard_onetime', 1, false),
  ('premium', 'Premium', 1490, 'EUR', 30, 'cv_premium_onetime', 2, false),
  ('unlimited6', 'Unlimited 6 Monate', 2990, 'EUR', 180, 'cv_unlimited6_onetime', 3, true),
  ('unlimited12', 'Unlimited 12 Monate', 4490, 'EUR', 365, 'cv_unlimited12_onetime', 4, false);