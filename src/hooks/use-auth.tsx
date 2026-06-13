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

interface HierarchyContext {
  isMaster: boolean
  isFranchisee: boolean
  isMerchant: boolean
  isAffiliate: boolean
  canAccessFranchise: (fId: string) => boolean
  canAccessCompany: (cId: string) => boolean
  canAccessAffiliate: (aId: string) => boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  role: string | null
  companyId: string | null
  franchiseId: string | null
  affiliateId: string | null
  hierarchy: HierarchyContext
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
    if (role !== fetchedRole) {
      setRole(fetchedRole)
      try {
        localStorage.setItem('role', fetchedRole)
        localStorage.setItem('userRole', fetchedRole)
        sessionStorage.removeItem('last_route')
        sessionStorage.removeItem('navigation_state')
      } catch (e) {
        console.warn('LocalStorage not available')
      }
    }
  }

  const loadProfile = useCallback(
    async (currentUser: User, isMounted = true) => {
      if (!currentUser) return

      const isAdailton =
        currentUser.email?.toLowerCase() === 'adailtong@gmail.com'

      if (isMounted) {
        const metaRole = isAdailton
          ? 'super_admin'
          : currentUser.user_metadata?.role

        if (metaRole) applyRole(metaRole)
        if (currentUser.user_metadata?.company_id)
          setCompanyId(currentUser.user_metadata.company_id)
        if (currentUser.user_metadata?.franchise_id)
          setFranchiseId(currentUser.user_metadata.franchise_id)
      }

      try {
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (!data && !error) {
          const fallbackRole = isAdailton
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
            console.error('Failed to auto-heal profile', upsertError)
          }
        }

        if (isMounted) {
          setProfile(data || null)

          const finalCompanyId =
            data?.company_id || currentUser?.user_metadata?.company_id || null
          const finalFranchiseId =
            data?.franchise_id ||
            currentUser?.user_metadata?.franchise_id ||
            null

          setCompanyId(finalCompanyId)
          setFranchiseId(finalFranchiseId)

          let resolvedRole = isAdailton
            ? 'super_admin'
            : data?.role || currentUser?.user_metadata?.role || 'user'

          if (resolvedRole === 'affiliate') {
            const { data: affData } = await supabase
              .from('affiliate_partners')
              .select('id')
              .eq('user_id', currentUser.id)
              .maybeSingle()
            setAffiliateId(affData?.id || null)
          }

          applyRole(resolvedRole)

          const metaUpdates: any = {}
          let needsMetaUpdate = false
          if (resolvedRole !== currentUser.user_metadata?.role) {
            metaUpdates.role = resolvedRole
            needsMetaUpdate = true
          }
          if (
            finalCompanyId &&
            finalCompanyId !== currentUser.user_metadata?.company_id
          ) {
            metaUpdates.company_id = finalCompanyId
            needsMetaUpdate = true
          }
          if (
            finalFranchiseId &&
            finalFranchiseId !== currentUser.user_metadata?.franchise_id
          ) {
            metaUpdates.franchise_id = finalFranchiseId
            needsMetaUpdate = true
          }

          if (needsMetaUpdate) {
            supabase.auth.updateUser({ data: metaUpdates }).catch(console.error)
          }
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error)
        if (isMounted) {
          const isAdailton =
            currentUser.email?.toLowerCase() === 'adailtong@gmail.com'
          const fallback = isAdailton
            ? 'super_admin'
            : currentUser.user_metadata?.role || 'user'
          applyRole(fallback)
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
        } catch {
          /* intentionally ignored */
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
  }, [loadProfile])

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

  // Hierarchy Context Methods
  const isMaster =
    role === 'super_admin' ||
    role === 'admin' ||
    user?.email?.toLowerCase() === 'adailtong@gmail.com'
  const isFranchisee = role === 'franchisee' || isMaster
  const isMerchant = role === 'merchant' || role === 'shopkeeper' || isMaster
  const isAffiliate = role === 'affiliate' || isMaster

  const hierarchy: HierarchyContext = {
    isMaster,
    isFranchisee,
    isMerchant,
    isAffiliate,
    canAccessFranchise: (fId: string) =>
      isMaster || (role === 'franchisee' && franchiseId === fId),
    canAccessCompany: (cId: string) =>
      isMaster ||
      ((role === 'merchant' || role === 'shopkeeper') && companyId === cId),
    canAccessAffiliate: (aId: string) =>
      isMaster || (role === 'affiliate' && affiliateId === aId),
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
        hierarchy,
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
