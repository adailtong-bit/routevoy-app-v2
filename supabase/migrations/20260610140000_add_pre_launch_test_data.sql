DO $$
DECLARE
  v_user_id uuid;
  v_campaign_id uuid := '10000000-0000-0000-0000-000000000001'::uuid;
  v_company_id text := 'comp-test-1';
BEGIN
  -- Get or create adailtong@gmail.com roles
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Ensure adailtong is super_admin to view admin/merchant features
    UPDATE public.profiles 
    SET role = 'super_admin' 
    WHERE id = v_user_id;
  END IF;

  -- Insert a mock company if needed
  INSERT INTO public.merchants (id, name, email) 
  VALUES (v_company_id, 'Tech Store', 'tech@example.com')
  ON CONFLICT (id) DO NOTHING;

  -- Insert a Pre-Launch Campaign for Mission Progress Testing
  INSERT INTO public.discovered_promotions (
    id, title, description, price, currency, image_url, store_name, 
    status, environment, promotion_model, engagement_threshold, 
    reward_type, reward_value, reward_description, company_id
  ) VALUES (
    v_campaign_id,
    'Pre-Launch: iPhone 16 Pro Max',
    'Be the first to get the new iPhone 16 Pro Max. Share with 3 friends to unlock a 20% discount coupon!',
    1199,
    'USD',
    'https://img.usecurling.com/p/400/300?q=iphone',
    'Tech Store',
    'published',
    'production',
    'pre-launch',
    3,
    'Standard Discount',
    20,
    '20% OFF iPhone 16 Pro Max',
    v_company_id
  ) ON CONFLICT (id) DO NOTHING;
END $$;
