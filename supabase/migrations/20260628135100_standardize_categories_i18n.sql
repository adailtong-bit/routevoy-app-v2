CREATE OR REPLACE FUNCTION public.check_affiliate_platform_access()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_platform_ids JSONB;
  v_store_name TEXT;
  v_link TEXT;
  v_has_access BOOLEAN := FALSE;
  v_key TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS NULL OR v_role != 'affiliate' THEN
    RETURN NEW;
  END IF;

  SELECT platform_ids INTO v_platform_ids 
  FROM public.affiliate_partners 
  WHERE user_id = auth.uid() AND status = 'active';

  IF v_platform_ids IS NULL OR v_platform_ids = '{}'::jsonb THEN
    RAISE EXCEPTION 'Affiliate has no authorized platforms.';
  END IF;

  IF TG_TABLE_NAME = 'discovered_promotions' THEN
    v_store_name := NEW.store_name;
    v_link := NEW.product_link;
  ELSIF TG_TABLE_NAME = 'ad_campaigns' THEN
    v_store_name := NEW.title;
    v_link := NEW.link;
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(v_platform_ids)
  LOOP
    IF (v_store_name IS NOT NULL AND v_store_name ILIKE '%' || v_key || '%') OR (v_link IS NOT NULL AND v_link ILIKE '%' || v_key || '%') THEN
      v_has_access := TRUE;
      EXIT;
    END IF;
  END LOOP;

  IF NOT v_has_access THEN
    RAISE EXCEPTION 'Not authorized to promote campaigns for this platform. Please request affiliation approval first.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  -- Standardize ad_campaigns.category to English keys
  UPDATE ad_campaigns SET category = 'food' WHERE category ILIKE 'Alimentação' OR category ILIKE 'Alimentacion' OR category ILIKE 'Food % Dining' OR category ILIKE 'Food';
  UPDATE ad_campaigns SET category = 'general' WHERE category ILIKE 'Geral' OR category ILIKE 'General';
  UPDATE ad_campaigns SET category = 'fashion' WHERE category ILIKE 'Moda' OR category ILIKE 'Fashion';
  UPDATE ad_campaigns SET category = 'services' WHERE category ILIKE 'Serviços' OR category ILIKE 'Servicios' OR category ILIKE 'Services';
  UPDATE ad_campaigns SET category = 'electronics' WHERE category ILIKE 'Eletrônicos' OR category ILIKE 'Electrónica' OR category ILIKE 'Electronics';
  UPDATE ad_campaigns SET category = 'leisure' WHERE category ILIKE 'Lazer' OR category ILIKE 'Ocio' OR category ILIKE 'Leisure' OR category ILIKE 'Entertainment';
  UPDATE ad_campaigns SET category = 'market' WHERE category ILIKE 'Mercado' OR category ILIKE 'Market';
  UPDATE ad_campaigns SET category = 'beauty' WHERE category ILIKE 'Beleza' OR category ILIKE 'Belleza' OR category ILIKE 'Beauty';
  UPDATE ad_campaigns SET category = 'health' WHERE category ILIKE 'Saúde' OR category ILIKE 'Salud' OR category ILIKE 'Health';
  UPDATE ad_campaigns SET category = 'education' WHERE category ILIKE 'Educação' OR category ILIKE 'Educación' OR category ILIKE 'Education';
  UPDATE ad_campaigns SET category = 'travel' WHERE category ILIKE 'Viagens' OR category ILIKE 'Viajes' OR category ILIKE 'Travel';
  UPDATE ad_campaigns SET category = 'others' WHERE category ILIKE 'Outros' OR category ILIKE 'Otros' OR category ILIKE 'Others';
  UPDATE ad_campaigns SET category = 'retail' WHERE category ILIKE 'Varejo' OR category ILIKE 'Retail';
  UPDATE ad_campaigns SET category = 'general' WHERE category IS NULL OR category = '';

  -- Standardize categories table: delete old-named duplicates first, then update remaining
  -- food
  DELETE FROM categories WHERE (name ILIKE 'Alimentação' OR name ILIKE 'Food % Dining' OR name ILIKE 'Food' OR name ILIKE 'Alimentacion') AND name NOT ILIKE 'food' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'food');
  UPDATE categories SET name = 'food', label = 'Food & Dining', icon = 'Utensils' WHERE name ILIKE 'Alimentação' OR name ILIKE 'Food % Dining' OR name ILIKE 'Food' OR name ILIKE 'Alimentacion';

  -- general
  DELETE FROM categories WHERE (name ILIKE 'Geral' OR name ILIKE 'General') AND name NOT ILIKE 'general' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'general');
  UPDATE categories SET name = 'general', label = 'General', icon = 'Tag' WHERE name ILIKE 'Geral' OR name ILIKE 'General';

  -- fashion
  DELETE FROM categories WHERE (name ILIKE 'Moda' OR name ILIKE 'Fashion') AND name NOT ILIKE 'fashion' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'fashion');
  UPDATE categories SET name = 'fashion', label = 'Fashion', icon = 'Shirt' WHERE name ILIKE 'Moda' OR name ILIKE 'Fashion';

  -- services
  DELETE FROM categories WHERE (name ILIKE 'Serviços' OR name ILIKE 'Services' OR name ILIKE 'Servicios') AND name NOT ILIKE 'services' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'services');
  UPDATE categories SET name = 'services', label = 'Services', icon = 'Briefcase' WHERE name ILIKE 'Serviços' OR name ILIKE 'Services' OR name ILIKE 'Servicios';

  -- electronics
  DELETE FROM categories WHERE (name ILIKE 'Eletrônicos' OR name ILIKE 'Electronics' OR name ILIKE 'Electrónica') AND name NOT ILIKE 'electronics' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'electronics');
  UPDATE categories SET name = 'electronics', label = 'Electronics', icon = 'Smartphone' WHERE name ILIKE 'Eletrônicos' OR name ILIKE 'Electronics' OR name ILIKE 'Electrónica';

  -- leisure
  DELETE FROM categories WHERE (name ILIKE 'Lazer' OR name ILIKE 'Leisure' OR name ILIKE 'Entertainment' OR name ILIKE 'Ocio' OR name ILIKE 'Entretenimento') AND name NOT ILIKE 'leisure' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'leisure');
  UPDATE categories SET name = 'leisure', label = 'Leisure & Entertainment', icon = 'Sparkles' WHERE name ILIKE 'Lazer' OR name ILIKE 'Leisure' OR name ILIKE 'Entertainment' OR name ILIKE 'Ocio' OR name ILIKE 'Entretenimento';

  -- market
  DELETE FROM categories WHERE (name ILIKE 'Mercado' OR name ILIKE 'Market') AND name NOT ILIKE 'market' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'market');
  UPDATE categories SET name = 'market', label = 'Market & Groceries', icon = 'ShoppingCart' WHERE name ILIKE 'Mercado' OR name ILIKE 'Market';

  -- beauty
  DELETE FROM categories WHERE (name ILIKE 'Beleza' OR name ILIKE 'Beauty' OR name ILIKE 'Belleza') AND name NOT ILIKE 'beauty' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'beauty');
  UPDATE categories SET name = 'beauty', label = 'Beauty', icon = 'Heart' WHERE name ILIKE 'Beleza' OR name ILIKE 'Beauty' OR name ILIKE 'Belleza';

  -- health
  DELETE FROM categories WHERE (name ILIKE 'Saúde' OR name ILIKE 'Health' OR name ILIKE 'Salud') AND name NOT ILIKE 'health' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'health');
  UPDATE categories SET name = 'health', label = 'Health', icon = 'Stethoscope' WHERE name ILIKE 'Saúde' OR name ILIKE 'Health' OR name ILIKE 'Salud';

  -- education
  DELETE FROM categories WHERE (name ILIKE 'Educação' OR name ILIKE 'Education' OR name ILIKE 'Educación') AND name NOT ILIKE 'education' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'education');
  UPDATE categories SET name = 'education', label = 'Education', icon = 'BookOpen' WHERE name ILIKE 'Educação' OR name ILIKE 'Education' OR name ILIKE 'Educación';

  -- travel
  DELETE FROM categories WHERE (name ILIKE 'Viagens' OR name ILIKE 'Travel' OR name ILIKE 'Viajes') AND name NOT ILIKE 'travel' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'travel');
  UPDATE categories SET name = 'travel', label = 'Travel & Hotels', icon = 'Plane' WHERE name ILIKE 'Viagens' OR name ILIKE 'Travel' OR name ILIKE 'Viajes';

  -- others
  DELETE FROM categories WHERE (name ILIKE 'Outros' OR name ILIKE 'Others' OR name ILIKE 'Otros') AND name NOT ILIKE 'others' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'others');
  UPDATE categories SET name = 'others', label = 'Others', icon = 'MoreHorizontal' WHERE name ILIKE 'Outros' OR name ILIKE 'Others' OR name ILIKE 'Otros';

  -- retail
  DELETE FROM categories WHERE (name ILIKE 'Varejo' OR name ILIKE 'Retail') AND name NOT ILIKE 'retail' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'retail');
  UPDATE categories SET name = 'retail', label = 'Retail', icon = 'ShoppingBag' WHERE name ILIKE 'Varejo' OR name ILIKE 'Retail';

  -- entertainment (merge into leisure if leisure exists, otherwise rename)
  DELETE FROM categories WHERE (name ILIKE 'Entretenimento' OR name ILIKE 'Entertainment') AND name NOT ILIKE 'leisure' AND EXISTS (SELECT 1 FROM categories c2 WHERE c2.name = 'leisure');
  UPDATE categories SET name = 'entertainment', label = 'Entertainment', icon = 'Sparkles' WHERE name ILIKE 'Entretenimento' OR name ILIKE 'Entertainment';

  -- Ensure standard categories exist with English keys
  INSERT INTO categories (name, label, icon, status) VALUES
    ('food', 'Food & Dining', 'Utensils', 'active'),
    ('general', 'General', 'Tag', 'active'),
    ('fashion', 'Fashion', 'Shirt', 'active'),
    ('services', 'Services', 'Briefcase', 'active'),
    ('electronics', 'Electronics', 'Smartphone', 'active'),
    ('travel', 'Travel & Hotels', 'Plane', 'active'),
    ('leisure', 'Leisure & Entertainment', 'Sparkles', 'active'),
    ('market', 'Market & Groceries', 'ShoppingCart', 'active'),
    ('beauty', 'Beauty', 'Heart', 'active'),
    ('health', 'Health', 'Stethoscope', 'active'),
    ('education', 'Education', 'BookOpen', 'active'),
    ('retail', 'Retail', 'ShoppingBag', 'active'),
    ('others', 'Others', 'MoreHorizontal', 'active')
  ON CONFLICT (name) DO NOTHING;
END $$;

-- Ensure auth seed user exists
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
