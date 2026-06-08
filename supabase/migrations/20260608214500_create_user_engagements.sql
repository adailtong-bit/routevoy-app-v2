CREATE TABLE IF NOT EXISTS public.user_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.discovered_promotions(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_engagements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_insert_engagements" ON public.user_engagements;
CREATE POLICY "authenticated_insert_engagements" ON public.user_engagements
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_select_engagements" ON public.user_engagements;
CREATE POLICY "authenticated_select_engagements" ON public.user_engagements
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  );

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;
