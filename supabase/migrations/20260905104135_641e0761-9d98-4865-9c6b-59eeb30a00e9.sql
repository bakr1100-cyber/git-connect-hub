CREATE TABLE public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_no text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('standard','premium')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','failed')),
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own purchases"
ON public.purchases FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX purchases_user_active_idx ON public.purchases (user_id, status, expires_at DESC);