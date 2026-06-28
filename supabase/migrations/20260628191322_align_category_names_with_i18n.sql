DO $$
BEGIN
  -- Merge 'hotéis'/'hoteis' into 'hotels' (standard English key matching translations)
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'hotels') THEN
    UPDATE categories SET name = 'hotels', label = 'Hotels', icon = 'Bed'
    WHERE name ILIKE 'hotéis' OR name ILIKE 'hoteis';
  ELSE
    DELETE FROM categories WHERE name ILIKE 'hotéis' OR name ILIKE 'hoteis';
  END IF;

  -- Update references in ad_campaigns
  UPDATE ad_campaigns SET category = 'hotels'
  WHERE category ILIKE 'hotéis' OR category ILIKE 'hoteis';

  -- Update references in discovered_promotions
  UPDATE discovered_promotions SET category = 'hotels'
  WHERE category ILIKE 'hotéis' OR category ILIKE 'hoteis';

  -- Update references in coupons
  UPDATE coupons SET category = 'hotels'
  WHERE category ILIKE 'hotéis' OR category ILIKE 'hoteis';

  -- Merge 'entertainment' into 'leisure' if both exist (standard key is 'leisure')
  IF EXISTS (SELECT 1 FROM categories WHERE name = 'entertainment')
     AND EXISTS (SELECT 1 FROM categories WHERE name = 'leisure') THEN
    UPDATE ad_campaigns SET category = 'leisure' WHERE category = 'entertainment';
    UPDATE discovered_promotions SET category = 'leisure' WHERE category = 'entertainment';
    UPDATE coupons SET category = 'leisure' WHERE category = 'entertainment';
    DELETE FROM categories WHERE name = 'entertainment';
  END IF;

  -- Ensure all standard categories exist with English keys matching translation file
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
    ('hotels', 'Hotels', 'Bed', 'active'),
    ('others', 'Others', 'MoreHorizontal', 'active')
  ON CONFLICT (name) DO NOTHING;
END $$;
