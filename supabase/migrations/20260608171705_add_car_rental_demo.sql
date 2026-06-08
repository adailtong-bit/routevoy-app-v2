-- Add description column to ad_campaigns
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS description text;

-- Insert Demo Car Rental Campaigns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.ad_campaigns WHERE title = '[DEMO] Localiza - Aluguel de Econômico') THEN
    INSERT INTO public.ad_campaigns (id, title, category, price, status, placement, environment, description) VALUES
    (gen_random_uuid(), '[DEMO] Localiza - Aluguel de Econômico', 'car_rental', 120.00, 'active', 'experiences_tab', 'development', 'Desconto especial para locação de carros econômicos.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.ad_campaigns WHERE title = '[DEMO] Movida - Upgrade para SUV') THEN
    INSERT INTO public.ad_campaigns (id, title, category, price, status, placement, environment, description) VALUES
    (gen_random_uuid(), '[DEMO] Movida - Upgrade para SUV', 'car_rental', 250.00, 'active', 'experiences_tab', 'development', 'Reserve um sedan e ganhe upgrade para SUV.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.ad_campaigns WHERE title = '[DEMO] Hertz - Pacote Semanal') THEN
    INSERT INTO public.ad_campaigns (id, title, category, price, status, placement, environment, description) VALUES
    (gen_random_uuid(), '[DEMO] Hertz - Pacote Semanal', 'car_rental', 850.00, 'active', 'experiences_tab', 'development', 'Tarifa plana para locações acima de 7 dias.');
  END IF;
END $$;
