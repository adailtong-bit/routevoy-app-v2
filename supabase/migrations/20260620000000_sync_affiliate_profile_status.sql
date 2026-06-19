DO $$
BEGIN
  -- Ensure trigger function for affiliate -> profile sync
  CREATE OR REPLACE FUNCTION public.sync_affiliate_status_to_profile()
  RETURNS trigger AS $func$
  BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      UPDATE public.profiles
      SET status = NEW.status
      WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_affiliate_status_changed ON public.affiliate_partners;
  CREATE TRIGGER on_affiliate_status_changed
    AFTER UPDATE OF status ON public.affiliate_partners
    FOR EACH ROW EXECUTE FUNCTION public.sync_affiliate_status_to_profile();

  -- Ensure trigger function for profile -> affiliate sync
  CREATE OR REPLACE FUNCTION public.sync_profile_status_to_affiliate()
  RETURNS trigger AS $func$
  BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.is_affiliate = true THEN
      UPDATE public.affiliate_partners
      SET status = NEW.status
      WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_profile_status_changed ON public.profiles;
  CREATE TRIGGER on_profile_status_changed
    AFTER UPDATE OF status ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_status_to_affiliate();

  -- Realtime Publication for instant UI updates
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
  END IF;
END $$;

-- Ensure profiles RLS is absolutely correct for the auth guard
DROP POLICY IF EXISTS "auth_read_own_profile" ON public.profiles;
CREATE POLICY "auth_read_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
