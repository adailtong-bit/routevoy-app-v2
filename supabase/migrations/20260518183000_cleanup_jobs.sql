DO $$
BEGIN
  DELETE FROM public.discovered_promotions 
  WHERE title ILIKE '%vaga%' 
     OR title ILIKE '%emprego%' 
     OR title ILIKE '%job %' 
     OR title ILIKE '%jobs%'
     OR title ILIKE '%career%' 
     OR title ILIKE '%hiring%' 
     OR title ILIKE '%trabalhe%'
     OR title ILIKE '%recruitment%'
     OR title ILIKE '%salary%'
     OR title ILIKE '%salário%'
     OR title ILIKE '%resume%';
END $$;
