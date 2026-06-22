-- Update RLS policy to allow affiliates to update their own discovered promotions
DROP POLICY IF EXISTS "affiliate_update_discovered_promotions" ON public.discovered_promotions;

CREATE POLICY "affiliate_update_discovered_promotions" 
ON public.discovered_promotions 
FOR UPDATE 
TO authenticated 
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
  )
  OR auth.jwt()->>'email' = 'adailtong@gmail.com'
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
)
WITH CHECK (
  affiliate_id IN (
    SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
  )
  OR auth.jwt()->>'email' = 'adailtong@gmail.com'
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);
