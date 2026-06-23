CREATE TABLE IF NOT EXISTS public.platform_pricing_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('merchant', 'affiliate')),
    tier TEXT NOT NULL CHECK (tier IN ('small', 'medium', 'large')),
    price NUMERIC NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
    environment TEXT NOT NULL DEFAULT 'production',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS pricing_config_id UUID REFERENCES public.platform_pricing_configs(id);
ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS pricing_config_id UUID REFERENCES public.platform_pricing_configs(id);

ALTER TABLE public.platform_pricing_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_platform_pricing_configs" ON public.platform_pricing_configs;
CREATE POLICY "admin_all_platform_pricing_configs" ON public.platform_pricing_configs
    FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_platform_pricing_configs_franchise_id ON public.platform_pricing_configs(franchise_id);
CREATE INDEX IF NOT EXISTS idx_platform_pricing_configs_entity_type ON public.platform_pricing_configs(entity_type);

DO $$
DECLARE
    new_user_id uuid;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
        new_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud,
            confirmation_token, recovery_token, email_change_token_new,
            email_change, email_change_token_current,
            phone, phone_change, phone_change_token, reauthentication_token
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'adailtong@gmail.com',
            crypt('Skip@Pass', gen_salt('bf')),
            NOW(), NOW(), NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Admin"}',
            false, 'authenticated', 'authenticated',
            '', '', '', '', '',
            NULL, '', '', ''
        );

        INSERT INTO public.profiles (id, email, name, role)
        VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Seed Pricing Configs
    IF NOT EXISTS (SELECT 1 FROM public.platform_pricing_configs WHERE entity_type = 'merchant' AND tier = 'small' AND franchise_id IS NULL) THEN
        INSERT INTO public.platform_pricing_configs (entity_type, tier, price, environment) VALUES 
            ('merchant', 'small', 99.90, 'production'),
            ('merchant', 'medium', 199.90, 'production'),
            ('merchant', 'large', 299.90, 'production'),
            ('affiliate', 'small', 49.90, 'production'),
            ('affiliate', 'medium', 99.90, 'production'),
            ('affiliate', 'large', 149.90, 'production');
    END IF;
END $$;
