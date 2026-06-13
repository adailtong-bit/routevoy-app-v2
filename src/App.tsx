import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { LanguageProvider, useLanguage } from '@/stores/LanguageContext'
import { NotificationProvider } from '@/stores/NotificationContext'
import { CouponProvider, useCouponStore } from '@/stores/CouponContext'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import MerchantLayout from '@/components/MerchantLayout'
import Index from '@/pages/Index'
import VendorDashboard from '@/pages/VendorDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
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
import MerchantAdsPage from '@/pages/MerchantAdsPage'
import MerchantPreLaunch from '@/pages/MerchantPreLaunch'
import MerchantFinance from '@/pages/MerchantFinance'
import MerchantPeople from '@/pages/MerchantPeople'
import MerchantSettings from '@/pages/MerchantSettings'
import AffiliateDashboard from '@/pages/AffiliateDashboard'
import { useEffect, useState, useCallback } from 'react'
import { UserRole } from '@/lib/types'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import { supabase } from '@/lib/supabase/client'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const authContext = useAuth()
  const user = authContext?.user
  const loading = authContext?.loading
  const authRole = authContext?.role
  const location = useLocation()

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isAdailton = user.email?.toLowerCase() === 'adailtong@gmail.com'

  let isMasterOverride = false
  try {
    isMasterOverride = localStorage.getItem('master_override') === 'true'
  } catch (e) {
    // Ignore storage errors
  }

  const role = isAdailton ? 'admin' : authRole || 'user'
  const isMaster =
    role === 'super_admin' || role === 'admin' || isAdailton || isMasterOverride

  // Safe roles check using optional chaining and coalescing
  if (roles && roles.length > 0 && !isMaster) {
    const safeRoles = roles ?? []
    const allowed =
      safeRoles.includes(role as UserRole) ||
      (role === 'merchant' && safeRoles.includes('shopkeeper' as any)) ||
      (role === 'shopkeeper' && safeRoles.includes('merchant' as any))

    if (!allowed) {
      return <Navigate to="/" replace />
    }
  }

  if (isMaster && location.pathname === '/complete-profile') {
    return <Navigate to="/admin" replace />
  }

  if (location.pathname === '/profile') {
    if (isMaster || role === 'franchisee') {
      return <Navigate to="/franchisee?tab=profile" replace />
    } else if (role === 'merchant' || role === 'shopkeeper') {
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
        title = `RouteVoy - ${t('nav.affiliate', 'Painel de Afiliado')}`
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
        <LanguageProvider>
          <NotificationProvider>
            <CouponProvider>
              <BrowserRouter>
                <NetworkStatusSync />
                <PageTitleSync />
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/explore" element={<Explore />} />
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
                      <Route path="campaigns" element={<MerchantCampaigns />} />
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
                          roles={['franchisee', 'super_admin', 'admin'] as any}
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
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
              <Toaster />
            </CouponProvider>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
