DO $$
BEGIN
  -- Remover registros que são claramente vagas de emprego, pois este é um site de cupons/viagens
  DELETE FROM public.discovered_promotions
  WHERE 
    category ILIKE '%emprego%' 
    OR category ILIKE '%vaga%'
    OR title ILIKE '%vaga %'
    OR title ILIKE '%vagas %'
    OR title ILIKE '%emprego%'
    OR title ILIKE '%contrata-%'
    OR title ILIKE '%oportunidade de trabalho%';
END $$;
