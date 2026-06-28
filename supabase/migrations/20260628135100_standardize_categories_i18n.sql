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

  -- Standardize categories table name to English keys
  UPDATE categories SET name = 'food' WHERE name ILIKE 'Alimentação' OR name ILIKE 'Food % Dining' OR name ILIKE 'Food';
  UPDATE categories SET name = 'general' WHERE name ILIKE 'Geral' OR name ILIKE 'General';
  UPDATE categories SET name = 'fashion' WHERE name ILIKE 'Moda' OR name ILIKE 'Fashion';
  UPDATE categories SET name = 'services' WHERE name ILIKE 'Serviços' OR name ILIKE 'Services';
  UPDATE categories SET name = 'electronics' WHERE name ILIKE 'Eletrônicos' OR name ILIKE 'Electronics';
  UPDATE categories SET name = 'leisure' WHERE name ILIKE 'Lazer' OR name ILIKE 'Leisure' OR name ILIKE 'Entertainment';
  UPDATE categories SET name = 'market' WHERE name ILIKE 'Mercado' OR name ILIKE 'Market';
  UPDATE categories SET name = 'beauty' WHERE name ILIKE 'Beleza' OR name ILIKE 'Beauty';
  UPDATE categories SET name = 'health' WHERE name ILIKE 'Saúde' OR name ILIKE 'Health';
  UPDATE categories SET name = 'education' WHERE name ILIKE 'Educação' OR name ILIKE 'Education';
  UPDATE categories SET name = 'travel' WHERE name ILIKE 'Viagens' OR name ILIKE 'Travel';
  UPDATE categories SET name = 'others' WHERE name ILIKE 'Outros' OR name ILIKE 'Others';
  UPDATE categories SET name = 'entertainment' WHERE name ILIKE 'Entretenimento' OR name ILIKE 'Entertainment';

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
