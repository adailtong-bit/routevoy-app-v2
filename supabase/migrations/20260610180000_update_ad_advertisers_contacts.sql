ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS contacts JSONB DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.ad_advertisers WHERE company_name = 'Acme Corp') THEN
    INSERT INTO public.ad_advertisers (
      id, 
      company_name, 
      tax_id, 
      contact_name,
      email,
      phone,
      contacts, 
      environment
    )
    VALUES (
      gen_random_uuid(),
      'Acme Corp',
      '12345678000199',
      'Jane Smith',
      'finance@acme.com',
      '555-0102',
      '[
        {"name": "John Doe", "position": "CEO", "phone": "555-0101", "email": "john@acme.com"},
        {"name": "Jane Smith", "position": "Financeiro", "phone": "555-0102", "email": "finance@acme.com"},
        {"name": "Bob Brown", "position": "Marketing", "phone": "555-0103", "email": "marketing@acme.com"}
      ]'::jsonb,
      'production'
    );
  END IF;
END $$;
