DO $$
BEGIN
  -- Add admin-specific policy for discovered_promotions to ensure update/delete operations are allowed for admins
  DROP POLICY IF EXISTS "admin_manage_discovered_promotions" ON public.discovered_promotions;
  CREATE POLICY "admin_manage_discovered_promotions" ON public.discovered_promotions
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        JOIN public.profiles ON profiles.id = auth.users.id
        WHERE auth.users.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
      )
      OR auth.jwt() ->> 'email' = 'adailtong@gmail.com'
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM auth.users
        JOIN public.profiles ON profiles.id = auth.users.id
        WHERE auth.users.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
      )
      OR auth.jwt() ->> 'email' = 'adailtong@gmail.com'
    );
END $$;
