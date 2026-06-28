-- Finalize category normalization: ensure all category names are English lowercase keys
-- matching the translation dictionary in src/lib/translations.ts

-- Normalize categories table
UPDATE public.categories SET name = 'food' WHERE name ILIKE 'alimentação' OR name ILIKE 'alimentacion';
UPDATE public.categories SET name = 'hotels' WHERE name ILIKE 'hotéis' OR name ILIKE 'hoteis' OR name ILIKE 'hoteles';
UPDATE public.categories SET name = 'leisure' WHERE name ILIKE 'lazer' OR name ILIKE 'ocio';
UPDATE public.categories SET name = 'services' WHERE name ILIKE 'serviços' OR name ILIKE 'servicios';
UPDATE public.categories SET name = 'electronics' WHERE name ILIKE 'eletrônicos' OR name ILIKE 'electronica' OR name ILIKE 'electrónica';
UPDATE public.categories SET name = 'market' WHERE name ILIKE 'mercado';
UPDATE public.categories SET name = 'beauty' WHERE name ILIKE 'beleza' OR name ILIKE 'belleza';
UPDATE public.categories SET name = 'health' WHERE name ILIKE 'saúde' OR name ILIKE 'salud';
UPDATE public.categories SET name = 'education' WHERE name ILIKE 'educação' OR name ILIKE 'educacion' OR name ILIKE 'educación';
UPDATE public.categories SET name = 'travel' WHERE name ILIKE 'viagens' OR name ILIKE 'viajes';
UPDATE public.categories SET name = 'retail' WHERE name ILIKE 'varejo';
UPDATE public.categories SET name = 'others' WHERE name ILIKE 'outros' OR name ILIKE 'otros';
UPDATE public.categories SET name = 'fashion' WHERE name ILIKE 'moda';
UPDATE public.categories SET name = 'general' WHERE name ILIKE 'geral';
UPDATE public.categories SET name = 'entertainment' WHERE name ILIKE 'entretenimento' OR name ILIKE 'entretenimiento';
UPDATE public.categories SET name = 'cars' WHERE name ILIKE 'carros' OR name ILIKE 'coches';
UPDATE public.categories SET name = 'activities' WHERE name ILIKE 'atividades' OR name ILIKE 'actividades';

-- Update labels to match English canonical labels
UPDATE public.categories SET label = 'Food & Dining' WHERE name = 'food';
UPDATE public.categories SET label = 'General' WHERE name = 'general';
UPDATE public.categories SET label = 'Fashion' WHERE name = 'fashion';
UPDATE public.categories SET label = 'Services' WHERE name = 'services';
UPDATE public.categories SET label = 'Electronics' WHERE name = 'electronics';
UPDATE public.categories SET label = 'Travel & Hotels' WHERE name = 'travel';
UPDATE public.categories SET label = 'Leisure & Entertainment' WHERE name = 'leisure';
UPDATE public.categories SET label = 'Market & Groceries' WHERE name = 'market';
UPDATE public.categories SET label = 'Beauty' WHERE name = 'beauty';
UPDATE public.categories SET label = 'Health' WHERE name = 'health';
UPDATE public.categories SET label = 'Education' WHERE name = 'education';
UPDATE public.categories SET label = 'Retail' WHERE name = 'retail';
UPDATE public.categories SET label = 'Others' WHERE name = 'others';
UPDATE public.categories SET label = 'Entertainment' WHERE name = 'entertainment';
UPDATE public.categories SET label = 'Hotels' WHERE name = 'hotels';
UPDATE public.categories SET label = 'Cars' WHERE name = 'cars';
UPDATE public.categories SET label = 'Activities' WHERE name = 'activities';

-- Ensure standard categories exist
INSERT INTO public.categories (name, label, icon, status) VALUES
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
  ('others', 'Others', 'MoreHorizontal', 'active'),
  ('entertainment', 'Entertainment', 'Sparkles', 'active'),
  ('hotels', 'Hotels', 'Bed', 'active'),
  ('cars', 'Cars', 'Car', 'active'),
  ('activities', 'Activities', 'Ticket', 'active')
ON CONFLICT (name) DO NOTHING;

-- Normalize category references in ad_campaigns
UPDATE ad_campaigns SET category = 'food' WHERE category ILIKE 'alimentação' OR category ILIKE 'alimentacion';
UPDATE ad_campaigns SET category = 'hotels' WHERE category ILIKE 'hotéis' OR category ILIKE 'hoteis' OR category ILIKE 'hoteles';
UPDATE ad_campaigns SET category = 'leisure' WHERE category ILIKE 'lazer' OR category ILIKE 'ocio';
UPDATE ad_campaigns SET category = 'services' WHERE category ILIKE 'serviços' OR category ILIKE 'servicios';
UPDATE ad_campaigns SET category = 'electronics' WHERE category ILIKE 'eletrônicos' OR category ILIKE 'electronica' OR category ILIKE 'electrónica';
UPDATE ad_campaigns SET category = 'market' WHERE category ILIKE 'mercado';
UPDATE ad_campaigns SET category = 'beauty' WHERE category ILIKE 'beleza' OR category ILIKE 'belleza';
UPDATE ad_campaigns SET category = 'health' WHERE category ILIKE 'saúde' OR category ILIKE 'salud';
UPDATE ad_campaigns SET category = 'education' WHERE category ILIKE 'educação' OR category ILIKE 'educacion' OR category ILIKE 'educación';
UPDATE ad_campaigns SET category = 'travel' WHERE category ILIKE 'viagens' OR category ILIKE 'viajes';
UPDATE ad_campaigns SET category = 'retail' WHERE category ILIKE 'varejo';
UPDATE ad_campaigns SET category = 'others' WHERE category ILIKE 'outros' OR category ILIKE 'otros';
UPDATE ad_campaigns SET category = 'fashion' WHERE category ILIKE 'moda';
UPDATE ad_campaigns SET category = 'general' WHERE category ILIKE 'geral';
UPDATE ad_campaigns SET category = 'entertainment' WHERE category ILIKE 'entretenimento' OR category ILIKE 'entretenimiento';
UPDATE ad_campaigns SET category = 'cars' WHERE category ILIKE 'carros' OR category ILIKE 'coches';
UPDATE ad_campaigns SET category = 'activities' WHERE category ILIKE 'atividades' OR category ILIKE 'actividades';
UPDATE ad_campaigns SET category = 'general' WHERE category IS NULL OR category = '';

-- Normalize category references in discovered_promotions
UPDATE discovered_promotions SET category = 'food' WHERE category ILIKE 'alimentação' OR category ILIKE 'alimentacion';
UPDATE discovered_promotions SET category = 'hotels' WHERE category ILIKE 'hotéis' OR category ILIKE 'hoteis' OR category ILIKE 'hoteles';
UPDATE discovered_promotions SET category = 'leisure' WHERE category ILIKE 'lazer' OR category ILIKE 'ocio';
UPDATE discovered_promotions SET category = 'services' WHERE category ILIKE 'serviços' OR category ILIKE 'servicios';
UPDATE discovered_promotions SET category = 'electronics' WHERE category ILIKE 'eletrônicos' OR category ILIKE 'electronica' OR category ILIKE 'electrónica';
UPDATE discovered_promotions SET category = 'market' WHERE category ILIKE 'mercado';
UPDATE discovered_promotions SET category = 'beauty' WHERE category ILIKE 'beleza' OR category ILIKE 'belleza';
UPDATE discovered_promotions SET category = 'health' WHERE category ILIKE 'saúde' OR category ILIKE 'salud';
UPDATE discovered_promotions SET category = 'education' WHERE category ILIKE 'educação' OR category ILIKE 'educacion' OR category ILIKE 'educación';
UPDATE discovered_promotions SET category = 'travel' WHERE category ILIKE 'viagens' OR category ILIKE 'viajes';
UPDATE discovered_promotions SET category = 'retail' WHERE category ILIKE 'varejo';
UPDATE discovered_promotions SET category = 'others' WHERE category ILIKE 'outros' OR category ILIKE 'otros';
UPDATE discovered_promotions SET category = 'fashion' WHERE category ILIKE 'moda';
UPDATE discovered_promotions SET category = 'general' WHERE category ILIKE 'geral';
UPDATE discovered_promotions SET category = 'entertainment' WHERE category ILIKE 'entretenimento' OR category ILIKE 'entretenimiento';
UPDATE discovered_promotions SET category = 'cars' WHERE category ILIKE 'carros' OR category ILIKE 'coches';
UPDATE discovered_promotions SET category = 'activities' WHERE category ILIKE 'atividades' OR category ILIKE 'actividades';

-- Normalize category references in coupons
UPDATE coupons SET category = 'food' WHERE category ILIKE 'alimentação' OR category ILIKE 'alimentacion';
UPDATE coupons SET category = 'hotels' WHERE category ILIKE 'hotéis' OR category ILIKE 'hoteis' OR category ILIKE 'hoteles';
UPDATE coupons SET category = 'leisure' WHERE category ILIKE 'lazer' OR category ILIKE 'ocio';
UPDATE coupons SET category = 'services' WHERE category ILIKE 'serviços' OR category ILIKE 'servicios';
UPDATE coupons SET category = 'electronics' WHERE category ILIKE 'eletrônicos' OR category ILIKE 'electronica' OR category ILIKE 'electrónica';
UPDATE coupons SET category = 'market' WHERE category ILIKE 'mercado';
UPDATE coupons SET category = 'beauty' WHERE category ILIKE 'beleza' OR category ILIKE 'belleza';
UPDATE coupons SET category = 'health' WHERE category ILIKE 'saúde' OR category ILIKE 'salud';
UPDATE coupons SET category = 'education' WHERE category ILIKE 'educação' OR category ILIKE 'educacion' OR category ILIKE 'educación';
UPDATE coupons SET category = 'travel' WHERE category ILIKE 'viagens' OR category ILIKE 'viajes';
UPDATE coupons SET category = 'retail' WHERE category ILIKE 'varejo';
UPDATE coupons SET category = 'others' WHERE category ILIKE 'outros' OR category ILIKE 'otros';
UPDATE coupons SET category = 'fashion' WHERE category ILIKE 'moda';
UPDATE coupons SET category = 'general' WHERE category ILIKE 'geral';
UPDATE coupons SET category = 'entertainment' WHERE category ILIKE 'entretenimento' OR category ILIKE 'entretenimiento';
UPDATE coupons SET category = 'cars' WHERE category ILIKE 'carros' OR category ILIKE 'coches';
UPDATE coupons SET category = 'activities' WHERE category ILIKE 'atividades' OR category ILIKE 'actividades';
