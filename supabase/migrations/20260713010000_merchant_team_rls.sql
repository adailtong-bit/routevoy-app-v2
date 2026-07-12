-- RLS policies for merchant team management (CRUD on profiles with same company_id)
DO $$
BEGIN
  -- SELECT: merchants can read profiles in their company
  DROP POLICY IF EXISTS "merchant_select_company_profiles" ON public.profiles;
  CREATE POLICY "merchant_select_company_profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'attendant')
        AND p.company_id IS NOT NULL
        AND p.company_id = profiles.company_id
      )
    );

  -- UPDATE: merchants (managers+) can update profiles in their company
  DROP POLICY IF EXISTS "merchant_update_company_profiles" ON public.profiles;
  CREATE POLICY "merchant_update_company_profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('merchant', 'shopkeeper', 'manager', 'supervisor')
        AND p.company_id IS NOT NULL
        AND p.company_id = profiles.company_id
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('merchant', 'shopkeeper', 'manager', 'supervisor')
        AND p.company_id IS NOT NULL
        AND p.company_id = profiles.company_id
      )
    );

  -- DELETE: merchants can remove profiles from their company
  DROP POLICY IF EXISTS "merchant_delete_company_profiles" ON public.profiles;
  CREATE POLICY "merchant_delete_company_profiles" ON public.profiles
    FOR DELETE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('merchant', 'shopkeeper', 'manager', 'supervisor')
        AND p.company_id IS NOT NULL
        AND p.company_id = profiles.company_id
      )
    );
END $$;
