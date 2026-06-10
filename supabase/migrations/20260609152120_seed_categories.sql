DO $$
BEGIN
  INSERT INTO public.categories (id, name, label, icon, status) VALUES
    (gen_random_uuid(), 'food', 'Food & Dining', 'Utensils', 'active'),
    (gen_random_uuid(), 'fashion', 'Fashion', 'Shirt', 'active'),
    (gen_random_uuid(), 'services', 'Services', 'Briefcase', 'active'),
    (gen_random_uuid(), 'electronics', 'Electronics', 'Smartphone', 'active'),
    (gen_random_uuid(), 'travel', 'Travel & Hotels', 'Ticket', 'active'),
    (gen_random_uuid(), 'leisure', 'Leisure & Entertainment', 'Sparkles', 'active'),
    (gen_random_uuid(), 'market', 'Market & Groceries', 'ShoppingCart', 'active')
  ON CONFLICT (name) DO NOTHING;
END $$;
