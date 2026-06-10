CREATE TABLE IF NOT EXISTS public.crm_target_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT REFERENCES public.merchants(id) ON DELETE CASCADE,
    franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    filters JSONB,
    lead_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT REFERENCES public.merchants(id) ON DELETE CASCADE,
    franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_group_id UUID REFERENCES public.crm_target_groups(id) ON DELETE SET NULL,
    channel TEXT NOT NULL,
    geographic_scope TEXT,
    randomization_type TEXT,
    randomization_value INT,
    content TEXT,
    is_exclusive BOOLEAN DEFAULT FALSE,
    grouping_identifier TEXT,
    linked_offer_id TEXT REFERENCES public.coupons(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    scheduled_at TIMESTAMPTZ,
    clicks INT DEFAULT 0,
    redemptions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.crm_target_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_target_groups" ON public.crm_target_groups;
CREATE POLICY "authenticated_all_target_groups" ON public.crm_target_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "authenticated_all_crm_campaigns" ON public.crm_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
