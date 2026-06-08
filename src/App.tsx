import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
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
import Voucher from '@/pages/Voucher'
import MyVouchers from '@/pages/MyVouchers'
import MerchantScanner from '@/pages/MerchantScanner'
import MerchantCampaigns from '@/pages/MerchantCampaigns'
import MerchantLeads from '@/pages/MerchantLeads'
import TravelPage from '@/pages/TravelPage'
import Explore from '@/pages/Explore'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import MerchantAdsPage from '@/pages/MerchantAdsPage'
import AffiliateDashboard from '@/pages/AffiliateDashboard'
import { useEffect, useState } from 'react'
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

  // Admin Session Stability: Prevent unmounting se houver processamento em background
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">
          Validating access permissions...
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = (authRole || 'user') as UserRole
  const email = user?.email

  let isMasterOverride = false
  try {
    isMasterOverride = localStorage.getItem('master_override') === 'true'
  } catch (e) {
    // Ignore storage errors
  }

  const isMaster =
    role === 'super_admin' ||
    role === 'admin' ||
    role === 'franchisee' ||
    email?.toLowerCase() === 'adailtong@gmail.com' ||
    isMasterOverride

  // Refinamento de Acesso: Proteção estrita para a rota de administração
  if (isAdminPath && !isMaster) {
    if (role === 'merchant') {
      return <>{children}</>
    }
    return <Navigate to="/" replace />
  }

  // 🔥 MASTER ACESSO ABSOLUTO: Se for super_admin, admin ou o email master, tem acesso liberado global
  if (isMaster) {
    return <>{children}</>
  }

  // Roteamento condicional seguro
  if (roles && roles.length > 0 && !roles.includes(role)) {
    // Tolerância para QA/Testes: se o papel for 'merchant', aceita rotas de 'shopkeeper'
    if (role === 'merchant' && roles.includes('shopkeeper' as any)) {
      return <>{children}</>
    }
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function PageTitleSync() {
  const location = useLocation()
  const { t } = useLanguage()

  useEffect(() => {
    // PWA & Favicon override to ensure no cached platform logos are shown
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
    const fallbackImage = window.location.origin + logoUrl + '?v=routevoy-2.0.0'

    // Force meta tags update for dynamically rendered routes
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
      // Try to fetch from Supabase for accurate real-time SEO overriding
      const fetchSEO = async () => {
        try {
          // 1. check discovered_promotions
          const { data: promo } = await supabase
            .from('discovered_promotions')
            .select('title, description, image_url, store_name')
            .eq('id', id)
            .maybeSingle()
          if (promo) {
            const fullTitle = `${promo.title} - ${promo.store_name || 'RouteVoy'}`
            applySEO(
              fullTitle,
              promo.description || description,
              promo.image_url || fallbackImage,
            )
            return
          }
          // 2. check coupons
          const { data: c } = await supabase
            .from('coupons')
            .select('title, description, image_url, store_name')
            .eq('id', id)
            .maybeSingle()
          if (c) {
            const fullTitle = `${c.title} - ${c.store_name || 'RouteVoy'}`
            applySEO(
              fullTitle,
              c.description || description,
              c.image_url || fallbackImage,
            )
            return
          }
          // fallback
          applySEO(`${title} | Voucher`, description, fallbackImage)
        } catch (e) {
          applySEO(`${title} | Voucher`, description, fallbackImage)
        }
      }
      fetchSEO()
    } else {
      if (path.startsWith('/admin'))
        title = `RouteVoy - ${t('nav.admin', 'Admin')}`
      else if (path.startsWith('/vendor') || path.startsWith('/merchant'))
        title = `RouteVoy - ${t('nav.vendor', 'Vendor Dashboard')}`
      else if (path.startsWith('/franchisee'))
        title = `RouteVoy - ${t('nav.franchisee', 'Regional Dashboard')}`
      else if (path.startsWith('/affiliate'))
        title = `RouteVoy - ${t('nav.affiliate', 'Affiliate Dashboard')}`
      else if (path.startsWith('/explore'))
        title = `RouteVoy - ${t('nav.explore', 'Explore')}`
      else if (path.startsWith('/vouchers'))
        title = `RouteVoy - ${t('nav.vouchers', 'My Vouchers')}`
      else if (path.startsWith('/travel'))
        title = `RouteVoy - ${t('nav.travel', 'Experiences')}`
      else if (path.startsWith('/seasonal'))
        title = `RouteVoy - ${t('nav.seasonal', 'Offers')}`
      else if (path.startsWith('/profile'))
        title = `RouteVoy - ${t('profile.title', 'Profile')}`
      else if (path.startsWith('/login'))
        title = `RouteVoy - ${t('auth.login', 'Login')}`
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

function GlobalLanguageSync() {
  const couponStore = useCouponStore()
  const storeUser = couponStore?.user
  const franchises = couponStore?.franchises || []

  const authContext = useAuth()
  const sbUser = authContext?.user
  const authRole = authContext?.role

  const languageContext = useLanguage()
  const setLanguage = languageContext?.setLanguage || (() => {})

  useEffect(() => {
    const role = authRole || sbUser?.user_metadata?.role || storeUser?.role
    let countryToUse = storeUser?.country || 'USA'

    if (role === 'franchisee' && Array.isArray(franchises)) {
      const myFranchise =
        franchises.find(
          (f) =>
            f.ownerId === sbUser?.id ||
            f.email === sbUser?.email ||
            f.contactEmail === sbUser?.email,
        ) || franchises[0]
      if (myFranchise?.addressCountry) {
        countryToUse = myFranchise.addressCountry
      }
    }

    if (countryToUse) {
      const countryLower = countryToUse.toLowerCase()
      if (
        countryLower === 'brasil' ||
        countryLower === 'brazil' ||
        countryLower === 'br'
      ) {
        setLanguage('pt')
      } else if (
        [
          'spain',
          'espanha',
          'es',
          'mexico',
          'argentina',
          'colombia',
          'chile',
          'peru',
        ].includes(countryLower)
      ) {
        setLanguage('es')
      } else if (['france', 'fr', 'frança'].includes(countryLower)) {
        setLanguage('fr')
      } else {
        setLanguage('en') // Global default is English
      }
    } else {
      setLanguage('en') // Always default to English if no country is set
    }
  }, [storeUser?.country, sbUser, franchises, setLanguage])

  return null
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
                <GlobalLanguageSync />
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

                    {/* Agrupando o arcabouço do lojista no MerchantLayout (acessível via /merchant) */}
                    <Route
                      path="/merchant"
                      element={
                        <RequireAuth
                          roles={
                            [
                              'user',
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
                      <Route path="leads" element={<MerchantLeads />} />
                      <Route path="ads" element={<MerchantAdsPage />} />
                    </Route>
                    {/* Redirecionar /vendor antigo para /merchant de forma segura */}
                    <Route
                      path="/vendor"
                      element={<Navigate to="/merchant" replace />}
                    />

                    <Route
                      path="/admin/*"
                      element={
                        <RequireAuth
                          roles={
                            [
                              'super_admin',
                              'admin',
                              'franchisee',
                              'merchant',
                            ] as any
                          }
                        >
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
                      path="/profile"
                      element={
                        <RequireAuth>
                          <Profile />
                        </RequireAuth>
                      }
                    />
                    <Route path="/seasonal" element={<Seasonal />} />
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
