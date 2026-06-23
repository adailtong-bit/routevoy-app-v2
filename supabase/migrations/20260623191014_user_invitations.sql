CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  company_id TEXT,
  franchise_id TEXT,
  status TEXT DEFAULT 'pending'::text,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage invitations" ON public.user_invitations;
CREATE POLICY "Admins can manage invitations" ON public.user_invitations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee')
    )
  );

DROP POLICY IF EXISTS "Anyone can read pending invitations" ON public.user_invitations;
CREATE POLICY "Anyone can read pending invitations" ON public.user_invitations
  FOR SELECT TO public
  USING (status = 'pending');

CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inv user_invitations%ROWTYPE;
BEGIN
  SELECT * INTO v_inv FROM user_invitations WHERE id = invitation_id AND status = 'pending';
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update the profile of the current user
  UPDATE public.profiles
  SET 
    role = v_inv.role,
    company_id = v_inv.company_id,
    franchise_id = v_inv.franchise_id,
    status = 'active'
  WHERE id = auth.uid();

  -- Mark invitation as used
  UPDATE public.user_invitations
  SET status = 'used'
  WHERE id = invitation_id;

  RETURN true;
END;
$$;
