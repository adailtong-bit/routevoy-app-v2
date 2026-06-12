import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  role: string | null
  companyId: string | null
  franchiseId: string | null
  affiliateId: string | null
  signUp: (
    email: string,
    password: string,
    options?: any,
  ) => Promise<{ error: any; data?: any }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: any; data?: any }>
  signOut: () => Promise<{ error: any }>
  syncProfile: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [role, setRole] = useState<string | null>(() => {
    try {
      return localStorage.getItem('role') || null
    } catch {
      return null
    }
  })
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [franchiseId, setFranchiseId] = useState<string | null>(null)
  const [affiliateId, setAffiliateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const applyRole = (fetchedRole: string) => {
    setRole(fetchedRole)
    try {
      localStorage.setItem('role', fetchedRole)
      localStorage.setItem('userRole', fetchedRole)
    } catch (e) {
      console.warn('LocalStorage not available')
    }
  }

  const loadProfile = useCallback(
    async (currentUser: User, isMounted = true) => {
      try {
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (!data && !error) {
          // Auto-heal profile if missing
          const fallbackRole =
            currentUser.email?.toLowerCase() === 'adailtong@gmail.com'
              ? 'super_admin'
              : currentUser.user_metadata?.role || 'user'

          const { data: newProfile, error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: currentUser.id,
              email: currentUser.email || '',
              name:
                currentUser.user_metadata?.name ||
                currentUser.email?.split('@')[0] ||
                'User',
              role: fallbackRole,
              is_affiliate: fallbackRole === 'affiliate',
            })
            .select()
            .maybeSingle()

          if (newProfile) {
            data = newProfile
          } else {
            // Log failed profile linkage attempt
            supabase
              .from('audit_logs')
              .insert([
                {
                  action: 'PROFILE_LINK_ERROR',
                  entity_type: 'auth',
                  details: `Failed to auto-heal profile for ${currentUser.email}. Error: ${upsertError?.message || 'Unknown'}`,
                  user_id: currentUser.id,
                },
              ])
              .then(() => {})
          }
        }

        if (isMounted) {
          setProfile(data || null)
          setCompanyId(data?.company_id || null)
          setFranchiseId(data?.franchise_id || null)

          let resolvedRole =
            data?.role || currentUser.user_metadata?.role || 'user'
          // Fallback to super_admin only if no role is explicitly set in DB for the master email
          if (
            currentUser.email?.toLowerCase() === 'adailtong@gmail.com' &&
            (!data?.role || data.role === 'user')
          ) {
            resolvedRole = 'super_admin'
          }

          if (resolvedRole === 'affiliate') {
            const { data: affData } = await supabase
              .from('affiliate_partners')
              .select('id')
              .eq('user_id', currentUser.id)
              .maybeSingle()
            setAffiliateId(affData?.id || null)
          }

          applyRole(resolvedRole)
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error)
        if (isMounted) {
          const fallback = currentUser.user_metadata?.role || 'user'
          applyRole(
            currentUser.email === 'adailtong@gmail.com'
              ? 'super_admin'
              : fallback,
          )

          // Log failed profile fetch
          supabase
            .from('audit_logs')
            .insert([
              {
                action: 'PROFILE_FETCH_ERROR',
                entity_type: 'auth',
                details: `Failed to fetch profile for ${currentUser.email}: ${error?.message || error}`,
                user_id: currentUser.id,
              },
            ])
            .then(() => {})
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    },
    [],
  )

  const syncProfile = useCallback(async () => {
    setLoading(true)
    const {
      data: { session },
    } = await supabase.auth.refreshSession()
    if (session?.user) {
      await loadProfile(session.user)
    }
    setLoading(false)
  }, [loadProfile])

  useEffect(() => {
    let isMounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!isMounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        loadProfile(currentSession.user, isMounted)
      } else {
        setProfile(null)
        setRole(null)
        setCompanyId(null)
        setFranchiseId(null)
        setAffiliateId(null)
        setLoading(false)
        try {
          localStorage.removeItem('role')
          localStorage.removeItem('userRole')
          sessionStorage.clear()
        } catch (e) {
          console.warn('Storage not available to clear')
        }
      }
    })

    supabase.auth
      .getSession()
      .then(({ data: { session: initSession } }) => {
        if (!isMounted) return
        setSession(initSession)
        setUser(initSession?.user ?? null)

        if (initSession?.user) {
          loadProfile(initSession.user, isMounted)
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Auth getSession error:', err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, options?: any) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: options || { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error, data }
  }

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error, data }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        companyId,
        franchiseId,
        affiliateId,
        signUp,
        signIn,
        signOut,
        syncProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
