DO $$
BEGIN
  -- Add preferred_currency to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_currency TEXT;
  
  -- Add preferred_currency to franchises
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS preferred_currency TEXT;
  
  -- Add preferred_currency to merchants
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS preferred_currency TEXT;

  -- Update existing master admin to USD
  UPDATE public.profiles 
  SET preferred_currency = 'USD' 
  WHERE email = 'adailtong@gmail.com' OR role IN ('admin', 'super_admin');
END $$;
