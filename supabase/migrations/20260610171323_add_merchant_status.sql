ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
