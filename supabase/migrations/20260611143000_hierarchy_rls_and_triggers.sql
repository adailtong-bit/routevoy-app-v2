-- Recreate the trigger for new users to properly assign business entities
CREATE OR REPLACE FUNCTION public.handle_new_user_after()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_name text;
  v_is_affiliate boolean;
  v_tax_id text;
  v_company_id text := NULL;
  v_merchant_id text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_is_affiliate := (v_role = 'affiliate');
  v_tax_id := NEW.raw_user_meta_data->>'tax_id';

  -- Handle merchant
  IF v_role IN ('merchant', 'shopkeeper') THEN
    SELECT id INTO v_merchant_id FROM public.merchants WHERE email = NEW.email LIMIT 1;
    IF v_merchant_id IS NULL THEN
      v_merchant_id := gen_random_uuid()::text;
      INSERT INTO public.merchants (id, name, email, status)
      VALUES (v_merchant_id, v_name || ' Store', NEW.email, 'active');
    END IF;
    v_company_id := v_merchant_id;
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    v_is_affiliate,
    v_tax_id,
    v_company_id
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    role = COALESCE(public.profiles.role, EXCLUDED.role),
    is_affiliate = COALESCE(public.profiles.is_affiliate, EXCLUDED.is_affiliate),
    tax_id = COALESCE(public.profiles.tax_id, EXCLUDED.tax_id),
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id);

  -- Handle affiliate
  IF v_role = 'affiliate' THEN
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      v_name,
      'active',
      v_tax_id
    )
    ON CONFLICT (email) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        tax_id = COALESCE(public.affiliate_partners.tax_id, EXCLUDED.tax_id);
  END IF;

  -- Handle franchisee
  IF v_role = 'franchisee' THEN
    IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = NEW.email) THEN
      INSERT INTO public.franchises (id, name, email)
      VALUES (gen_random_uuid()::text, v_name || ' Franchise', NEW.email);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Updates
DROP POLICY IF EXISTS "authenticated_select_engagements" ON public.user_engagements;
CREATE POLICY "authenticated_select_engagements" ON public.user_engagements
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN franchises f ON f.email = p.email
      JOIN coupons c ON c.id = user_engagements.campaign_id
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND c.franchise_id = f.id
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN coupons c ON c.id = user_engagements.campaign_id
      WHERE p.id = auth.uid() AND p.role IN ('merchant', 'shopkeeper') AND c.company_id::text = p.company_id
    )
  );

DROP POLICY IF EXISTS "franchisee_select_merchants" ON public.merchants;
CREATE POLICY "franchisee_select_merchants" ON public.merchants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN franchises f ON f.email = p.email
      WHERE p.id = auth.uid() AND p.role = 'franchisee'
    )
  );

DROP POLICY IF EXISTS "franchisee_select_coupons" ON public.coupons;
CREATE POLICY "franchisee_select_coupons" ON public.coupons
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN franchises f ON f.email = p.email
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND coupons.franchise_id = f.id
    )
  );
