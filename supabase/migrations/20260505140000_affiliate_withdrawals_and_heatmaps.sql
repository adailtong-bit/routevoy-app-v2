CREATE TABLE IF NOT EXISTS public.affiliate_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  request_date TIMESTAMPTZ DEFAULT NOW(),
  payment_date TIMESTAMPTZ,
  payment_method JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_withdrawals" ON public.affiliate_withdrawals;
CREATE POLICY "auth_all_withdrawals" ON public.affiliate_withdrawals
  FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_affiliate_id ON public.affiliate_withdrawals(affiliate_id);
