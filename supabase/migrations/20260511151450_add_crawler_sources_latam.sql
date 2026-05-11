DO $$
DECLARE
  source RECORD;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS temp_sources (
    name text,
    url text,
    category text,
    region text,
    country text,
    type text
  );

  INSERT INTO temp_sources (name, url, category, region, country, type) VALUES
  -- Hotéis / Aggregators (Global/LATAM)
  ('Hoteis.com', 'https://www.hoteis.com', 'Hotéis', 'Global', 'Global', 'web'),
  ('Booking.com', 'https://www.booking.com', 'Hotéis', 'Global', 'Global', 'web'),
  ('Trivago', 'https://www.trivago.com', 'Hotéis', 'Global', 'Global', 'web'),
  ('Airbnb', 'https://www.airbnb.com', 'Hotéis', 'Global', 'Global', 'web'),
  ('Expedia', 'https://www.expedia.com', 'Viagens', 'Global', 'Global', 'web'),
  ('Agoda', 'https://www.agoda.com', 'Hotéis', 'Global', 'Global', 'web'),
  ('Tripadvisor', 'https://www.tripadvisor.com', 'Viagens', 'Global', 'Global', 'web'),
  ('Kayak', 'https://www.kayak.com', 'Viagens', 'Global', 'Global', 'web'),
  ('Hopper', 'https://www.hopper.com', 'Viagens', 'Global', 'Global', 'web'),

  -- OTAs e Agências (LATAM)
  ('Decolar', 'https://www.decolar.com', 'Viagens', 'América Latina', 'Brasil', 'web'),
  ('Despegar', 'https://www.despegar.com', 'Viagens', 'América Latina', 'Multi', 'web'),
  ('ViajaNet', 'https://www.viajanet.com.br', 'Viagens', 'América Latina', 'Brasil', 'web'),
  ('BestDay', 'https://www.bestday.com.mx', 'Viagens', 'América Latina', 'México', 'web'),
  ('Hurb', 'https://www.hurb.com', 'Viagens', 'América Latina', 'Brasil', 'web'),
  ('CVC', 'https://www.cvc.com.br', 'Viagens', 'América Latina', 'Brasil', 'web'),
  ('Zarpo', 'https://www.zarpo.com.br', 'Hotéis', 'América Latina', 'Brasil', 'web'),
  ('Almundo', 'https://almundo.com.ar', 'Viagens', 'América Latina', 'Argentina', 'web'),
  ('Viajes Falabella', 'https://www.viajesfalabella.cl', 'Viagens', 'América Latina', 'Chile', 'web'),
  ('PriceTravel', 'https://www.pricetravel.com', 'Viagens', 'América Latina', 'México', 'web'),
  ('Submarino Viagens', 'https://www.submarinoviagens.com.br', 'Viagens', 'América Latina', 'Brasil', 'web'),
  ('Atrápalo AR', 'https://www.atrapalo.com.ar', 'Viagens', 'América Latina', 'Argentina', 'web'),
  ('Atrápalo CL', 'https://www.atrapalo.cl', 'Viagens', 'América Latina', 'Chile', 'web'),
  ('Tiquetes Baratos', 'https://www.tiquetesbaratos.com', 'Viagens', 'América Latina', 'Colômbia', 'web'),
  ('Aviatur', 'https://www.aviatur.com', 'Viagens', 'América Latina', 'Colômbia', 'web'),
  ('Cocha', 'https://www.cocha.com', 'Viagens', 'América Latina', 'Chile', 'web'),
  ('Nuevo Mundo', 'https://www.nuevomundo.cl', 'Viagens', 'América Latina', 'Chile', 'web'),
  ('MagniCharters', 'https://www.magnicharters.com', 'Viagens', 'América Latina', 'México', 'web'),
  ('Turismocity', 'https://www.turismocity.com.ar', 'Viagens', 'América Latina', 'Argentina', 'web'),
  ('Avantrip', 'https://www.avantrip.com', 'Viagens', 'América Latina', 'Argentina', 'web'),
  ('MaxMilhas', 'https://www.maxmilhas.com.br', 'Passagens', 'América Latina', 'Brasil', 'web'),
  ('123Milhas', 'https://123milhas.com', 'Passagens', 'América Latina', 'Brasil', 'web'),

  -- Companhias Aéreas (LATAM)
  ('LATAM Airlines', 'https://www.latamairlines.com', 'Passagens', 'América Latina', 'Multi', 'web'),
  ('Copa Airlines', 'https://www.copaair.com', 'Passagens', 'América Central', 'Panamá', 'web'),
  ('Azul', 'https://www.voeazul.com.br', 'Passagens', 'América Latina', 'Brasil', 'web'),
  ('Gol', 'https://www.voegol.com.br', 'Passagens', 'América Latina', 'Brasil', 'web'),
  ('Volaris', 'https://www.volaris.com', 'Passagens', 'América Latina', 'México', 'web'),
  ('Aeromexico', 'https://aeromexico.com', 'Passagens', 'América Latina', 'México', 'web'),

  -- Atrações e Experiências
  ('GetYourGuide', 'https://www.getyourguide.com.br', 'Atrações', 'Global', 'Global', 'web'),
  ('Viator', 'https://www.viator.com', 'Atrações', 'Global', 'Global', 'web'),
  ('Civitatis', 'https://www.civitatis.com', 'Atrações', 'Global', 'Global', 'web'),
  ('Xcaret', 'https://www.xcaret.com', 'Atrações', 'América Latina', 'México', 'web'),

  -- Locação de Carros
  ('Rentcars', 'https://www.rentcars.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('Skyscanner Carros', 'https://www.skyscanner.com.br/aluguel-de-carros', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('Rentalcars.com', 'https://www.rentalcars.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('Localiza', 'https://www.localiza.com', 'Aluguel de Carros', 'América Latina', 'Brasil', 'web'),
  ('Movida', 'https://www.movida.com.br', 'Aluguel de Carros', 'América Latina', 'Brasil', 'web'),
  ('Unidas', 'https://www.unidas.com.br', 'Aluguel de Carros', 'América Latina', 'Brasil', 'web'),
  ('Hertz', 'https://www.hertz.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('Europcar', 'https://www.europcar.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('Avis', 'https://www.avis.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('Alamo', 'https://www.alamo.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('National Car Rental', 'https://www.nationalcar.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('Sixt', 'https://www.sixt.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),
  ('Enterprise', 'https://www.enterprise.com', 'Aluguel de Carros', 'Global', 'Global', 'web'),

  -- Passagens Terrestres
  ('ClickBus', 'https://www.clickbus.com.br', 'Passagens', 'América Latina', 'Brasil', 'web'),
  ('Buser', 'https://www.buser.com.br', 'Passagens', 'América Latina', 'Brasil', 'web'),

  -- Redes de Resorts (Caribe / LATAM)
  ('Palladium Hotel Group', 'https://www.palladiumhotelgroup.com', 'Hotéis', 'Caribe', 'Multi', 'web'),
  ('Riu Hotels', 'https://www.riu.com', 'Hotéis', 'Caribe', 'Multi', 'web'),
  ('Iberostar', 'https://www.iberostar.com', 'Hotéis', 'Caribe', 'Multi', 'web'),
  ('Barceló', 'https://www.barcelo.com', 'Hotéis', 'Caribe', 'Multi', 'web'),
  ('Karisma Hotels', 'https://www.karismahotels.com', 'Hotéis', 'Caribe', 'Multi', 'web'),
  ('Decameron', 'https://www.decameron.com', 'Hotéis', 'América Latina', 'Colômbia', 'web'),
  ('Vidanta', 'https://www.vidanta.com', 'Hotéis', 'América Latina', 'México', 'web');

  FOR source IN SELECT * FROM temp_sources LOOP
    IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = source.url) THEN
      INSERT INTO public.crawler_sources (
        id, name, url, category, region, country, status, type, max_results, scan_radius
      ) VALUES (
        gen_random_uuid(), source.name, source.url, source.category, source.region, source.country, 'active', source.type, 200, 50
      );
    END IF;
  END LOOP;

  DROP TABLE temp_sources;
END $$;
