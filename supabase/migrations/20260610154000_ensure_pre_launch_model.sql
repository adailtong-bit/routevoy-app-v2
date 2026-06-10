DO $$
BEGIN
  -- Dropping any potential check constraints on promotion_model to ensure 'pre_launch' is accepted.
  -- The promotion_model column is type text, so it accepts any string unless constrained.
  ALTER TABLE public.discovered_promotions DROP CONSTRAINT IF EXISTS discovered_promotions_promotion_model_check;
END $$;
