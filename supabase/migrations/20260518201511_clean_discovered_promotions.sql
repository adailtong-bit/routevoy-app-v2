DO $$
BEGIN
  -- We truncate the table to clean the garbage data related to jobs and brazilian generic domains
  TRUNCATE TABLE public.discovered_promotions RESTART IDENTITY CASCADE;
  
  -- Clear crawler_logs as well to keep it consistent
  TRUNCATE TABLE public.crawler_logs RESTART IDENTITY CASCADE;
END $$;
