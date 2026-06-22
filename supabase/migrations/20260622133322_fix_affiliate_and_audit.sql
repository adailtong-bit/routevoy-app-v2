DO $$
DECLARE
  v_affiliate_id uuid;
BEGIN
  -- Select an existing affiliate or insert a placeholder
  SELECT id INTO v_affiliate_id FROM public.affiliate_partners LIMIT 1;
  
  IF v_affiliate_id IS NULL THEN
    v_affiliate_id := gen_random_uuid();
    INSERT INTO public.affiliate_partners (id, name, email, status)
    VALUES (v_affiliate_id, 'Test Affiliate', 'affiliate@test.com', 'active')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert test extraction campaign
  INSERT INTO public.discovered_promotions (
    title, is_demo, status, affiliate_id, price, original_price, 
    discount_percentage, category, store_name, image_url, product_link
  )
  VALUES (
    'Test Extraction Campaign', true, 'active', v_affiliate_id, 99.90, 150.00, 
    33.4, 'Electronics', 'Tech Store', 'https://img.usecurling.com/p/200/200?q=electronics', 'https://example.com/product'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- Ensure RLS policies exclude 'deleted' status for public views
-- Discovered Promotions
DROP POLICY IF EXISTS "public_read_discovered_promotions_new" ON public.discovered_promotions;
DROP POLICY IF EXISTS "public_read_promotions" ON public.discovered_promotions;
DROP POLICY IF EXISTS "public_all_discovered_promotions" ON public.discovered_promotions;

CREATE POLICY "public_read_promotions" ON public.discovered_promotions
  FOR SELECT USING (status NOT IN ('deleted', 'pending'));

CREATE POLICY "public_all_discovered_promotions" ON public.discovered_promotions
  FOR SELECT USING (status NOT IN ('deleted', 'pending'));

-- Ad Campaigns
DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "select_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;

CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns
  FOR SELECT USING (status NOT IN ('deleted', 'pending'));

-- Ensure audit_logs allows insert for authenticated users
DROP POLICY IF EXISTS "auth_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "auth_insert_audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
