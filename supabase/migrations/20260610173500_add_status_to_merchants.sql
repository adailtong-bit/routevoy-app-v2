ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
