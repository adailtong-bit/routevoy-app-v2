DO $$
BEGIN
  -- 1. Ensure affiliate_platforms is readable by authenticated users
  DROP POLICY IF EXISTS "authenticated_select_platforms" ON public.affiliate_platforms;
  CREATE POLICY "authenticated_select_platforms" ON public.affiliate_platforms
    FOR SELECT TO authenticated USING (true);

  -- 2. Ensure affiliate_partners allows user to update their own record
  DROP POLICY IF EXISTS "affiliate_update_own" ON public.affiliate_partners;
  CREATE POLICY "affiliate_update_own" ON public.affiliate_partners
    FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

  -- 3. Ensure affiliate_partners allows user to insert their own record
  DROP POLICY IF EXISTS "affiliate_insert_own" ON public.affiliate_partners;
  CREATE POLICY "affiliate_insert_own" ON public.affiliate_partners
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR email = current_setting('request.jwt.claims', true)::json->>'email');
END $$;
