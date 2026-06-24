import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { LanguageProvider, useLanguage } from '@/stores/LanguageContext'
import { RegionProvider } from '@/stores/RegionContext'
import { NotificationProvider } from '@/stores/NotificationContext'
import { CouponProvider, useCouponStore } from '@/stores/CouponContext'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import MerchantLayout from '@/components/MerchantLayout'
import Index from '@/pages/Index'
import VendorDashboard from '@/pages/VendorDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminPricingPage from '@/pages/admin/AdminPricingPage'
import FranchiseeDashboard from '@/pages/FranchiseeDashboard'
import Seasonal from '@/pages/Seasonal'
import SeasonalAgenda from '@/pages/SeasonalAgenda'
import Voucher from '@/pages/Voucher'
import MyVouchers from '@/pages/MyVouchers'
import MerchantScanner from '@/pages/MerchantScanner'
import MerchantCampaigns from '@/pages/MerchantCampaigns'
import MerchantLeads from '@/pages/MerchantLeads'
import TravelPage from '@/pages/TravelPage'
import Explore from '@/pages/Explore'
import CompleteProfile from '@/pages/CompleteProfile'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import ResetPassword from '@/pages/ResetPassword'
import MerchantAdsPage from '@/pages/MerchantAdsPage'
import MerchantPreLaunch from '@/pages/MerchantPreLaunch'
import MerchantFinance from '@/pages/MerchantFinance'
import MerchantPeople from '@/pages/MerchantPeople'
import MerchantSettings from '@/pages/MerchantSettings'
import AffiliateDashboard from '@/pages/AffiliateDashboard'
import Contact from '@/pages/Contact'
import PWAGuide from '@/pages/PWAGuide'
import WaitingApproval from '@/pages/WaitingApproval'
import ActivateAccount from '@/pages/ActivateAccount'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { UserRole } from '@/lib/types'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import { supabase } from '@/lib/supabase/client'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AutoLogoutMonitor } from '@/components/AutoLogoutMonitor'
import { RealtimeNotifications } from '@/components/shared/RealtimeNotifications'

function ResetPasswordRedirect() {
  const location = useLocation()
  return <Navigate to={`/login${location.search}${location.hash}`} replace />
}

function GlobalAuthRecovery() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    const search = window.location.search
    const isRecoveryUrl =
      hash.includes('type=recovery') || search.includes('type=recovery')

    if (isRecoveryUrl) {
      sessionStorage.setItem('isRecoveryMode', 'true')
      if (window.location.pathname !== '/login') {
        navigate(`/login${search}${hash}`, { replace: true })
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        sessionStorage.setItem('isRecoveryMode', 'true')
        if (window.location.pathname !== '/login') {
          navigate(`/login${window.location.search}${window.location.hash}`, {
            replace: true,
          })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return null
}

function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const authContext = useAuth()
  const user = authContext?.user
  const authLoading = authContext?.loading
  const authRole = authContext?.role
  const contextProfile = authContext?.profile
  const affiliateStatus = (authContext as any)?.affiliateStatus
  const location = useLocation()

  const [localProfile, setLocalProfile] = useState<any>(undefined)
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchFreshProfile = async () => {
      if (authLoading) return

      if (!user) {
        if (isMounted) {
          setLocalProfile(null)
          setIsValidating(false)
        }
        return
      }

      try {
        if (localProfile === undefined) {
          setIsValidating(true)
        }

        // Cache-busting query to ensure we get the absolute latest status from DB
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        // Also fetch affiliate status directly if they are an affiliate
        let freshAffiliateStatus = null
        if (
          authRole === 'affiliate' ||
          data?.is_affiliate ||
          contextProfile?.is_affiliate
        ) {
          const { data: affData } = await supabase
            .from('affiliate_partners')
            .select('status')
            .eq('user_id', user.id)
            .maybeSingle()

          if (affData) {
            freshAffiliateStatus = affData.status
          }
        }

        if (isMounted) {
          if (!error && data) {
            setLocalProfile({
              ...data,
              _freshAffiliateStatus: freshAffiliateStatus,
            })
          } else {
            setLocalProfile(
              contextProfile
                ? {
                    ...contextProfile,
                    _freshAffiliateStatus: freshAffiliateStatus,
                  }
                : null,
            )
          }
        }
      } catch (error) {
        console.error('Error fetching fresh profile:', error)
        if (isMounted) setLocalProfile(contextProfile || null)
      } finally {
        if (isMounted) setIsValidating(false)
      }
    }

    fetchFreshProfile()

    let profileSubscription: any = null
    if (user && !authLoading) {
      profileSubscription = supabase
        .channel(`public:profiles:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (isMounted && payload.new) {
              setLocalProfile(payload.new)
              if (authContext?.syncProfile) {
                authContext.syncProfile()
              }
            }
          },
        )
        .subscribe()
    }

    return () => {
      isMounted = false
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription)
      }
    }
  }, [user, authLoading])

  const currentProfile = localProfile || contextProfile

  const { isMaster, isAffiliateRole, resolvedRole } = useMemo(() => {
    let override = false
    try {
      override = localStorage.getItem('master_override') === 'true'
    } catch (e) {
      // Ignore
    }

    const baseRole = currentProfile?.role || authRole || 'user'
    const email = user?.email?.toLowerCase() || ''

    const master =
      baseRole === 'super_admin' ||
      baseRole === 'admin' ||
      override ||
      email === 'adailtong@gmail.com'

    const affiliate = Boolean(
      baseRole === 'affiliate' || currentProfile?.is_affiliate,
    )

    return {
      isMaster: master,
      isAffiliateRole: affiliate,
      resolvedRole: baseRole,
    }
  }, [authRole, currentProfile, user])

  let isCrawling = false
  try {
    isCrawling = sessionStorage.getItem('crawler_isScanning') === 'true'
  } catch (e) {
    // Ignore storage errors
  }
  const isAdminPath = location.pathname.startsWith('/admin')

  if (isCrawling && isAdminPath) {
    return <>{children}</>
  }

  // Wait until loading is false and the fresh profile is definitively fetched
  if (authLoading || isValidating || localProfile === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500 font-medium mt-2">
          Autenticando...
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Safe roles check using optional chaining and coalescing
  if (roles && roles.length > 0 && !isMaster) {
    const safeRoles = roles ?? []
    let allowed =
      safeRoles.includes(resolvedRole as UserRole) ||
      (resolvedRole === 'merchant' &&
        safeRoles.includes('shopkeeper' as any)) ||
      (resolvedRole === 'shopkeeper' &&
        safeRoles.includes('merchant' as any)) ||
      (resolvedRole === 'merchant' &&
        safeRoles.includes('franchisee' as any)) ||
      (resolvedRole === 'franchisee' && safeRoles.includes('merchant' as any))

    if (isAffiliateRole && safeRoles.includes('affiliate' as any)) {
      allowed = true
    }

    if (!allowed) {
      // Avoid infinite loop if we are already being rejected from /merchant but the user has some role
      // For instance, a 'user' trying to access /merchant will be redirected to /
      return <Navigate to="/" replace />
    }
  }

  if (isMaster && location.pathname === '/complete-profile') {
    return <Navigate to="/admin" replace />
  }

  if (isAffiliateRole && !isMaster) {
    const isProfileIncomplete =
      !currentProfile?.city ||
      !currentProfile?.state ||
      !currentProfile?.country ||
      !currentProfile?.phone ||
      !currentProfile?.name ||
      !currentProfile?.tax_id

    const freshAffStatus =
      currentProfile?._freshAffiliateStatus || affiliateStatus

    const isApproved =
      currentProfile?.status === 'approved' ||
      currentProfile?.status === 'active' ||
      freshAffStatus === 'approved' ||
      freshAffStatus === 'active'

    const isNotApproved = !isApproved

    if (location.pathname.startsWith('/affiliate')) {
      if (isProfileIncomplete) {
        return <Navigate to="/complete-profile" replace />
      }
      if (isNotApproved) {
        return <Navigate to="/waiting-approval" replace />
      }
    }

    if (location.pathname === '/waiting-approval') {
      if (isProfileIncomplete) {
        return <Navigate to="/complete-profile" replace />
      }
      if (isApproved) {
        return <Navigate to="/affiliate" replace />
      }
    }

    if (location.pathname === '/complete-profile') {
      if (!isProfileIncomplete) {
        if (isApproved) {
          return <Navigate to="/affiliate" replace />
        } else {
          return <Navigate to="/waiting-approval" replace />
        }
      }
    }
  } else {
    if (location.pathname === '/waiting-approval') {
      return <Navigate to="/complete-profile" replace />
    }
  }

  if (location.pathname === '/profile') {
    if (isMaster || resolvedRole === 'franchisee') {
      return <Navigate to="/franchisee?tab=profile" replace />
    } else if (resolvedRole === 'merchant' || resolvedRole === 'shopkeeper') {
      return <Navigate to="/merchant/settings" replace />
    }
  }

  return <>{children}</>
}

function PageTitleSync() {
  const location = useLocation()
  const { t } = useLanguage()

  useEffect(() => {
    const updateIcon = (rel: string) => {
      let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = rel
        document.head.appendChild(link)
      }
      link.href = logoUrl
    }

    updateIcon('icon')
    updateIcon('apple-touch-icon')
    updateIcon('apple-touch-icon-precomposed')
    updateIcon('shortcut icon')

    const path = location.pathname
    let title = 'RouteVoy - Cupons e Ofertas Geolocalizadas'
    let description =
      'Encontre os melhores cupons e promoções com geolocalização no RouteVoy.'
    const fallbackImage =
      (window?.location?.origin || '') + logoUrl + '?v=routevoy-2.0.0'

    const updateMeta = (property: string, content: string, isName = false) => {
      const selector = isName
        ? `meta[name='${property}']`
        : `meta[property='${property}']`
      let meta = document.querySelector(selector) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        if (isName) meta.setAttribute('name', property)
        else meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    const applySEO = (t: string, d: string, i: string) => {
      updateMeta('og:title', t)
      updateMeta('og:description', d)
      updateMeta('og:image', i)
      updateMeta('og:url', window.location.href)
      updateMeta('twitter:card', 'summary_large_image', true)
      updateMeta('twitter:title', t, true)
      updateMeta('twitter:description', d, true)
      updateMeta('twitter:image', i, true)
      document.title = t
    }

    const voucherMatch = path.match(/^\/voucher\/(.+)$/)

    if (voucherMatch) {
      const id = voucherMatch[1]
      const fetchSEO = async () => {
        try {
          const { data: promo } = await supabase
            .from('discovered_promotions')
            .select('title, description, image_url, store_name')
            .eq('id', id)
            .maybeSingle()
          if (promo) {
            const fullTitle = `${promo.title} - ${promo.store_name || 'RouteVoy'}`
            applySEO(
              fullTitle,
              promo?.description || description,
              promo?.image_url || fallbackImage,
            )
            return
          }
          const { data: c } = await supabase
            .from('coupons')
            .select('title, description, image_url, store_name')
            .eq('id', id)
            .maybeSingle()
          if (c) {
            const fullTitle = `${c.title} - ${c.store_name || 'RouteVoy'}`
            applySEO(
              fullTitle,
              c?.description || description,
              c?.image_url || fallbackImage,
            )
            return
          }
          applySEO(`${title} | Voucher`, description, fallbackImage)
        } catch (e) {
          applySEO(`${title} | Voucher`, description, fallbackImage)
        }
      }
      fetchSEO()
    } else {
      if (path.startsWith('/admin'))
        title = `RouteVoy - ${t('nav.admin', 'Painel Admin')}`
      else if (path.startsWith('/vendor') || path.startsWith('/merchant'))
        title = `RouteVoy - ${t('nav.vendor', 'Painel do Lojista')}`
      else if (path.startsWith('/franchisee'))
        title = `RouteVoy - ${t('nav.franchisee', 'Painel Regional')}`
      else if (path.startsWith('/affiliate'))
        title = `RouteVoy - ${t('nav.affiliate', 'Painel de Afiliados')}`
      else if (path.startsWith('/explore'))
        title = `RouteVoy - ${t('nav.explore', 'Explorar')}`
      else if (path.startsWith('/vouchers'))
        title = `RouteVoy - ${t('nav.vouchers', 'Meus Vouchers')}`
      else if (path.startsWith('/travel'))
        title = `RouteVoy - ${t('nav.travel', 'Experiências')}`
      else if (path.startsWith('/seasonal-calendar'))
        title = `RouteVoy - ${t('nav.seasonal', 'Calendário Sazonal')}`
      else if (path.startsWith('/profile'))
        title = `RouteVoy - ${t('profile.title', 'Perfil')}`
      else if (path.startsWith('/login'))
        title = `RouteVoy - ${t('auth.login', 'Entrar')}`
      else if (path === '/')
        title = `RouteVoy - Cupons e Ofertas Geolocalizadas`

      applySEO(title, description, fallbackImage)
    }
  }, [location, t])

  return null
}

function MobileMenuAutoClose() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only apply on mobile/tablet devices
      if (window.innerWidth >= 1024) return

      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (!link) return

      const href = link.getAttribute('href')
      // Ignore hash links or links without href
      if (!href || href.startsWith('#')) return

      // Check if the link is inside a Sheet/Drawer (Radix uses role="dialog")
      const dialog = target.closest('[role="dialog"]')
      if (!dialog) return

      // Dispatch Escape to explicitly trigger the component's onOpenChange(false)
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true,
      })
      document.dispatchEvent(escapeEvent)
    }

    // Use capture phase to ensure it runs before React Router might unmount the element
    document.addEventListener('click', handleClick, { capture: true })

    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  return null
}

function NetworkStatusSync() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <OfflineIndicator />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RegionProvider>
          <LanguageProvider>
            <NotificationProvider>
              <CouponProvider>
                <BrowserRouter>
                  <GlobalAuthRecovery />
                  <NetworkStatusSync />
                  <PageTitleSync />
                  <MobileMenuAutoClose />
                  <AutoLogoutMonitor />
                  <RealtimeNotifications />
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route
                        path="/reset-password"
                        element={<ResetPasswordRedirect />}
                      />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/pwa-guide" element={<PWAGuide />} />
                      <Route path="/activate" element={<ActivateAccount />} />
                      <Route
                        path="/vouchers"
                        element={
                          <RequireAuth>
                            <MyVouchers />
                          </RequireAuth>
                        }
                      />

                      <Route
                        path="/merchant"
                        element={
                          <RequireAuth
                            roles={
                              [
                                'shopkeeper',
                                'merchant',
                                'admin',
                                'super_admin',
                                'franchisee',
                              ] as any
                            }
                          >
                            <MerchantLayout />
                          </RequireAuth>
                        }
                      >
                        <Route index element={<VendorDashboard />} />
                        <Route path="scanner" element={<MerchantScanner />} />
                        <Route
                          path="campaigns"
                          element={<MerchantCampaigns />}
                        />
                        <Route
                          path="pre-launch"
                          element={<MerchantPreLaunch />}
                        />
                        <Route path="leads" element={<MerchantLeads />} />
                        <Route path="ads" element={<MerchantAdsPage />} />
                        <Route path="finance" element={<MerchantFinance />} />
                        <Route path="people" element={<MerchantPeople />} />
                        <Route path="settings" element={<MerchantSettings />} />
                      </Route>
                      <Route
                        path="/vendor"
                        element={<Navigate to="/merchant" replace />}
                      />

                      <Route
                        path="/admin/pricing"
                        element={
                          <RequireAuth roles={['super_admin', 'admin'] as any}>
                            <AdminPricingPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/admin/*"
                        element={
                          <RequireAuth roles={['super_admin', 'admin'] as any}>
                            <AdminDashboard />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/franchisee"
                        element={
                          <RequireAuth
                            roles={
                              ['franchisee', 'super_admin', 'admin'] as any
                            }
                          >
                            <FranchiseeDashboard />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/dashboard/franchisee"
                        element={<Navigate to="/franchisee" replace />}
                      />
                      <Route
                        path="/dashboard"
                        element={<Navigate to="/franchisee" replace />}
                      />

                      <Route
                        path="/affiliate"
                        element={
                          <RequireAuth
                            roles={['affiliate', 'super_admin', 'admin'] as any}
                          >
                            <AffiliateDashboard />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/dashboard/affiliate"
                        element={<Navigate to="/affiliate" replace />}
                      />
                      <Route
                        path="/profile"
                        element={
                          <RequireAuth>
                            <Profile />
                          </RequireAuth>
                        }
                      />
                      <Route path="/seasonal-calendar" element={<Seasonal />} />
                      <Route
                        path="/seasonal-agenda"
                        element={<SeasonalAgenda />}
                      />
                      <Route
                        path="/travel"
                        element={
                          <RequireAuth>
                            <TravelPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/travel/new"
                        element={
                          <RequireAuth>
                            <TravelPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/travel/:id"
                        element={
                          <RequireAuth>
                            <TravelPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/voucher/:id"
                        element={
                          <RequireAuth>
                            <Voucher />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/complete-profile"
                        element={
                          <RequireAuth>
                            <CompleteProfile />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/waiting-approval"
                        element={
                          <RequireAuth>
                            <WaitingApproval />
                          </RequireAuth>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
                <Toaster />
              </CouponProvider>
            </NotificationProvider>
          </LanguageProvider>
        </RegionProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
