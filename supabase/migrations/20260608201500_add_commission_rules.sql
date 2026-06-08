CREATE TABLE IF NOT EXISTS public.commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('publicidade', 'impulsionamento')),
    percentage NUMERIC NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_rules_valid_dates ON public.commission_rules(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_commission_rules_franchise_id ON public.commission_rules(franchise_id);

ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_commission_rules" ON public.commission_rules;
CREATE POLICY "public_read_commission_rules" ON public.commission_rules 
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "manage_commission_rules" ON public.commission_rules;
CREATE POLICY "manage_commission_rules" ON public.commission_rules 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  );

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.commission_rules WHERE franchise_id IS NULL AND service_type = 'publicidade') THEN
        INSERT INTO public.commission_rules (franchise_id, service_type, percentage, valid_from)
        VALUES (NULL, 'publicidade', 10, NOW());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.commission_rules WHERE franchise_id IS NULL AND service_type = 'impulsionamento') THEN
        INSERT INTO public.commission_rules (franchise_id, service_type, percentage, valid_from)
        VALUES (NULL, 'impulsionamento', 10, NOW());
    END IF;
END $$;
