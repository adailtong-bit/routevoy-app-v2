import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
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
  authorizedFranchiseIds: string[]
  authorizedCompanyIds: string[]
  authorizedAffiliateIds: string[]
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  role: string | null
  companyId: string | null
  franchiseId: string | null
  affiliateId: string | null
  affiliateStatus: string | null
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
  const [affiliateStatus, setAffiliateStatus] = useState<string | null>(null)

  // Initialize cleanly as empty arrays to prevent undefined .filter crashes downstream
  const [authorizedFranchiseIds] = useState<string[]>([])
  const [authorizedCompanyIds] = useState<string[]>([])
  const [authorizedAffiliateIds] = useState<string[]>([])

  const [loading, setLoading] = useState(true)

  const applyRole = useCallback((fetchedRole: string) => {
    setRole((prevRole) => {
      if (prevRole !== fetchedRole) {
        try {
          localStorage.setItem('role', fetchedRole)
          localStorage.setItem('userRole', fetchedRole)
          sessionStorage.removeItem('last_route')
          sessionStorage.removeItem('navigation_state')
        } catch (e) {
          console.warn('LocalStorage not available')
        }
        return fetchedRole
      }
      return prevRole
    })
  }, [])

  const loadProfile = useCallback(
    async (currentUser: User, isMounted = true) => {
      if (!currentUser) {
        if (isMounted) setLoading(false)
        return
      }

      const isMasterUser =
        currentUser.email?.toLowerCase() === 'adailtong@gmail.com'

      try {
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (!data && !error) {
          const fallbackRole = isMasterUser
            ? 'admin'
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
              company_id: currentUser.user_metadata?.company_id || null,
              franchise_id: currentUser.user_metadata?.franchise_id || null,
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

        const finalCompanyId =
          data?.company_id || currentUser.user_metadata?.company_id || null
        const finalFranchiseId =
          data?.franchise_id || currentUser.user_metadata?.franchise_id || null
        const resolvedRole = isMasterUser
          ? 'admin'
          : data?.role || currentUser.user_metadata?.role || 'user'

        const isMaster =
          resolvedRole === 'admin' ||
          resolvedRole === 'super_admin' ||
          currentUser.email?.toLowerCase() === 'adailtong@gmail.com'

        // Resolve preferred currency based on hierarchy
        let preferredCurrency = data?.preferred_currency || null
        if (!preferredCurrency && !isMaster) {
          if (finalCompanyId) {
            const { data: comp } = await supabase
              .from('merchants')
              .select('preferred_currency, country')
              .eq('id', finalCompanyId)
              .maybeSingle()
            if (comp?.preferred_currency)
              preferredCurrency = comp.preferred_currency
            else if (comp?.country === 'BR' || comp?.country === 'Brasil')
              preferredCurrency = 'BRL'
            else if (
              comp?.country === 'ES' ||
              comp?.country === 'Spain' ||
              comp?.country === 'Espanha'
            )
              preferredCurrency = 'EUR'
          }
          if (!preferredCurrency && finalFranchiseId) {
            const { data: franch } = await supabase
              .from('franchises')
              .select('preferred_currency, country')
              .eq('id', finalFranchiseId)
              .maybeSingle()
            if (franch?.preferred_currency)
              preferredCurrency = franch.preferred_currency
            else if (franch?.country === 'BR' || franch?.country === 'Brasil')
              preferredCurrency = 'BRL'
            else if (
              franch?.country === 'ES' ||
              franch?.country === 'Spain' ||
              franch?.country === 'Espanha'
            )
              preferredCurrency = 'EUR'
          }
        }

        if (data) {
          data.resolved_currency = preferredCurrency || 'USD'
        }

        if (isMounted) {
          setProfile(data || null)
          setCompanyId(finalCompanyId)
          setFranchiseId(finalFranchiseId)

          if (resolvedRole === 'affiliate' || data?.is_affiliate) {
            const { data: affData } = await supabase
              .from('affiliate_partners')
              .select('id, status')
              .eq('user_id', currentUser.id)
              .maybeSingle()
            if (affData) {
              setAffiliateId(affData.id)
              setAffiliateStatus(affData.status)
            } else {
              setAffiliateId(null)
              setAffiliateStatus(null)
            }
          } else {
            setAffiliateId(null)
            setAffiliateStatus(null)
          }

          applyRole(resolvedRole)
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error)
        if (isMounted) {
          const fallback = isMasterUser
            ? 'admin'
            : currentUser.user_metadata?.role || 'user'
          applyRole(fallback)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    },
    [applyRole],
  )

  const syncProfile = useCallback(async () => {
    setLoading(true)
    const {
      data: { session },
    } = await supabase.auth.refreshSession()
    if (session?.user) {
      await loadProfile(session.user)
    } else {
      setLoading(false)
    }
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
        setLoading(true)
        loadProfile(currentSession.user, isMounted)
      } else {
        setProfile(null)
        setRole(null)
        setCompanyId(null)
        setFranchiseId(null)
        setAffiliateId(null)
        setAffiliateStatus(null)
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

  const signUp = useCallback(
    async (email: string, password: string, options?: any) => {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: options || { emailRedirectTo: `${window.location.origin}/` },
      })
      return { error, data }
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error, data }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  // Simplified and robust hierarchy mapping
  const isMasterEmail = user?.email?.toLowerCase() === 'adailtong@gmail.com'
  const isMaster = role === 'super_admin' || role === 'admin' || isMasterEmail

  const isFranchisee = role === 'franchisee' || isMaster
  const isMerchant = role === 'merchant' || role === 'shopkeeper' || isMaster
  const isAffiliate = role === 'affiliate' || isMaster

  const hierarchy = useMemo<HierarchyContext>(
    () => ({
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
      authorizedFranchiseIds,
      authorizedCompanyIds,
      authorizedAffiliateIds,
    }),
    [
      isMaster,
      isFranchisee,
      isMerchant,
      isAffiliate,
      role,
      franchiseId,
      companyId,
      affiliateId,
      authorizedFranchiseIds,
      authorizedCompanyIds,
      authorizedAffiliateIds,
    ],
  )

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      role,
      companyId,
      franchiseId,
      affiliateId,
      affiliateStatus,
      hierarchy,
      signUp,
      signIn,
      signOut,
      syncProfile,
      loading,
    }),
    [
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
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
