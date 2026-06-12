-- Create Financial Ledger Table for Checking Account feature
CREATE TABLE IF NOT EXISTS public.financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
    affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    category TEXT,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    status TEXT NOT NULL DEFAULT 'completed',
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_financial_ledger_company ON public.financial_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_franchise ON public.financial_ledger(franchise_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_affiliate ON public.financial_ledger(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_user ON public.financial_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_date ON public.financial_ledger(transaction_date);

-- Enable RLS
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "admin_all_ledger" ON public.financial_ledger;
CREATE POLICY "admin_all_ledger" ON public.financial_ledger
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "franchisee_ledger" ON public.financial_ledger;
CREATE POLICY "franchisee_ledger" ON public.financial_ledger
    FOR SELECT TO authenticated
    USING (
        franchise_id IN (SELECT franchise_id FROM profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "merchant_ledger" ON public.financial_ledger;
CREATE POLICY "merchant_ledger" ON public.financial_ledger
    FOR SELECT TO authenticated
    USING (
        (company_id::text) IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "affiliate_ledger" ON public.financial_ledger;
CREATE POLICY "affiliate_ledger" ON public.financial_ledger
    FOR SELECT TO authenticated
    USING (
        affiliate_id IN (SELECT id FROM affiliate_partners WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "user_ledger" ON public.financial_ledger;
CREATE POLICY "user_ledger" ON public.financial_ledger
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Insert Seed Data to ensure the view is not empty for testing
DO $DO_BLOCK$
DECLARE
    v_merchant_id UUID;
    v_franchise_id TEXT;
    v_affiliate_id UUID;
BEGIN
    -- Get first available entities
    SELECT id::uuid INTO v_merchant_id FROM public.merchants LIMIT 1;
    SELECT id INTO v_franchise_id FROM public.franchises LIMIT 1;
    SELECT id INTO v_affiliate_id FROM public.affiliate_partners LIMIT 1;
    
    IF v_merchant_id IS NOT NULL THEN
        INSERT INTO public.financial_ledger (company_id, franchise_id, transaction_date, description, category, amount, type, status, reference_type)
        VALUES 
            (v_merchant_id, v_franchise_id, NOW() - INTERVAL '15 days', 'Initial Account Funding', 'Deposit', 2500.00, 'credit', 'completed', 'deposit'),
            (v_merchant_id, v_franchise_id, NOW() - INTERVAL '12 days', 'Ad Campaign Setup Fee', 'Marketing', 300.00, 'debit', 'completed', 'ad_fee'),
            (v_merchant_id, v_franchise_id, NOW() - INTERVAL '8 days', 'Weekly Sales Settlement', 'Sales', 1250.50, 'credit', 'completed', 'settlement'),
            (v_merchant_id, v_franchise_id, NOW() - INTERVAL '5 days', 'Platform Usage Fee', 'Fee', 99.00, 'debit', 'completed', 'fee'),
            (v_merchant_id, v_franchise_id, NOW() - INTERVAL '1 day', 'Daily Sales Settlement', 'Sales', 430.25, 'credit', 'completed', 'settlement')
        ON CONFLICT DO NOTHING;
    END IF;

    IF v_affiliate_id IS NOT NULL THEN
        INSERT INTO public.financial_ledger (affiliate_id, transaction_date, description, category, amount, type, status, reference_type)
        VALUES 
            (v_affiliate_id, NOW() - INTERVAL '10 days', 'Commission: Campaign X', 'Commission', 150.00, 'credit', 'completed', 'commission'),
            (v_affiliate_id, NOW() - INTERVAL '3 days', 'Withdrawal Request', 'Withdrawal', 100.00, 'debit', 'completed', 'withdrawal')
        ON CONFLICT DO NOTHING;
    END IF;
END $DO_BLOCK$;
