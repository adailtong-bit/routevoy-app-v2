DO $$
BEGIN
  -- 1. Ensure type constraint exists safely
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'financial_ledger_type_check'
  ) THEN
    ALTER TABLE public.financial_ledger ADD CONSTRAINT financial_ledger_type_check CHECK (type IN ('credit', 'debit'));
  END IF;
END $$;

-- 2. Ensure RLS is enabled on the table
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policy for franchisee ledger if it exists to make it idempotent
DROP POLICY IF EXISTS "franchisee_ledger" ON public.financial_ledger;

-- 4. Recreate the policy ensuring correct scope for franchisees and admins
CREATE POLICY "franchisee_ledger" ON public.financial_ledger
  FOR SELECT TO authenticated
  USING (
    (franchise_id IN (SELECT profiles.franchise_id FROM public.profiles WHERE profiles.id = auth.uid())) OR 
    (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
  );
