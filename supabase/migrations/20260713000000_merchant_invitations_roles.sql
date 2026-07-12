-- Add insert policy for user_invitations so merchants and franchisees can invite people
DROP POLICY IF EXISTS "Merchants and Franchisees can insert invitations" ON public.user_invitations;
CREATE POLICY "Merchants and Franchisees can insert invitations" ON public.user_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND (
        (profiles.role IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'attendant') AND profiles.company_id = user_invitations.company_id)
        OR
        (profiles.role = 'franchisee' AND profiles.franchise_id = user_invitations.franchise_id)
        OR
        (profiles.role IN ('super_admin', 'admin'))
      )
    )
  );
