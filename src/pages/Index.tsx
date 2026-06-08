import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { CouponCard } from '@/components/CouponCard'
import { PromotionCard } from '@/components/PromotionCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdSpace } from '@/components/AdSpace'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { CATEGORIES, POPULAR_DESTINATIONS } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Ticket,
  CalendarIcon,
  Gift,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
  MapPin,
  LayoutGrid,
  Utensils,
  Shirt,
  Briefcase,
  CircleEllipsis,
  Smartphone,
  ShoppingCart,
  Check,
  ChevronDown,
  ArrowLeft,
  Globe,
  ImageOff,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function IndexContent() {
  const { t, formatDate, language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const store = useCouponStore() || {}
  const user = store.user
  const coupons = Array.isArray(store.coupons) ? store.coupons : []
  const seasonalEvents = Array.isArray(store.seasonalEvents)
    ? store.seasonalEvents
    : []
  const trackSeasonalClick = store.trackSeasonalClick || (() => {})
  const userLocation = store.userLocation
  const reservedIds = Array.isArray(store.reservedIds) ? store.reservedIds : []
  const platformSettings = store.platformSettings || {}
  const reserveCoupon = store.reserveCoupon || (() => false)
  const dbPromotions = Array.isArray(store.dbPromotions)
    ? store.dbPromotions
    : []
  const isLoadingLocation =
    !!store.isLoadingLocation || !!store.isLoadingCoupons
  const hasErrorLoading = !!store.hasErrorLoading
  const refreshCoupons = store.refreshCoupons || (() => {})

  const isProduction =
    import.meta.env.VITE_APP_ENV === 'production' ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
  const { user: authUser, role: authRole } = useAuth()
  const isMaster =
    authRole === 'super_admin' ||
    authRole === 'admin' ||
    authRole === 'franchisee' ||
    authUser?.email?.toLowerCase() === 'adailtong@gmail.com'

  const isMerchantOrAdmin =
    isMaster || authRole === 'merchant' || authRole === 'shopkeeper'

  const [searchQuery, setSearchQuery] = useState('')
  const [searchCountry, setSearchCountry] = useState('')
  const [searchState, setSearchState] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const [isSearchingWeb, setIsSearchingWeb] = useState(false)
  const [supabasePromos, setSupabasePromos] = useState<any[]>([])
  const [seasonalPromos, setSeasonalPromos] = useState<any[]>([])
  const [dbCoupons, setDbCoupons] = useState<any[]>([])
  const [dbAds, setDbAds] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(300000)
  const itemsPerPage = 12

  const fetchAllData = useCallback(async () => {
    try {
      const currentEnv = isProduction ? 'production' : 'development'

      let promosQuery = supabase
        .from('discovered_promotions')
        .select('*')
        .in('status', ['published', 'approved', 'active'])
        .eq('environment', currentEnv)
        .order('captured_at', { ascending: false })
        .limit(100)

      let couponsQuery = supabase
        .from('coupons')
        .select('*')
        .in('status', ['active', 'approved', 'published'])
        .eq('environment', currentEnv)
        .order('created_at', { ascending: false })
        .limit(100)

      let adsQuery = supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'active')
        .eq('environment', currentEnv)
        .order('priority_score', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(20)

      if (searchCountry) {
        promosQuery = promosQuery.eq('country', searchCountry)
        couponsQuery = couponsQuery.eq('country', searchCountry)
        adsQuery = adsQuery.eq('country', searchCountry)
      }
      if (searchState) {
        promosQuery = promosQuery.eq('state', searchState)
        couponsQuery = couponsQuery.eq('state', searchState)
        adsQuery = adsQuery.eq('state', searchState)
      }
      if (searchCity) {
        promosQuery = promosQuery.eq('city', searchCity)
        couponsQuery = couponsQuery.eq('city', searchCity)
        adsQuery = adsQuery.eq('city', searchCity)
      }

      const [promosRes, couponsRes, adsRes, settingsRes] = await Promise.all([
        promosQuery,
        couponsQuery,
        adsQuery,
        supabase
          .from('site_settings')
          .select('*')
          .in('key', ['ad_refresh_interval']),
      ])

      if (settingsRes.data) {
        const intervalSetting = settingsRes.data.find(
          (s: any) => s.key === 'ad_refresh_interval',
        )
        if (intervalSetting?.value?.value) {
          setRefreshIntervalMs(Number(intervalSetting.value.value) * 1000)
        }
      }

      if (promosRes.data && !promosRes.error) {
        setSupabasePromos(promosRes.data.filter((p) => !p.is_seasonal))
        setSeasonalPromos(promosRes.data.filter((p) => p.is_seasonal))
      }

      if (couponsRes.data && !couponsRes.error) {
        const mapped = couponsRes.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          discount: c.discount,
          price: c.price,
          originalPrice: c.original_price,
          image: c.image_url,
          storeName: c.store_name,
          category: c.category,
          startDate: c.start_date,
          endDate: c.end_date,
          coordinates: { lat: Number(c.latitude), lng: Number(c.longitude) },
          locationName: c.location_name,
          country: c.country,
          state: c.state,
          city: c.city,
          status: c.status,
          isTrending: true,
          source: 'local',
          usageCount: c.usage_count || 0,
          isVerified: c.is_verified || false,
          isFeatured: c.is_featured || false,
        }))
        setDbCoupons(mapped)
      }

      if (adsRes.data && !adsRes.error) {
        const mappedAds = adsRes.data.map((ad: any) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          image: ad.image,
          storeName: 'Patrocinado',
          category: ad.category || 'Geral',
          status: ad.status,
          isFeatured: true,
          isTrending: true,
          source: 'ad',
          externalUrl: ad.link,
          price: ad.price,
          country: ad.country,
          state: ad.state,
          city: ad.city,
          priority_score: ad.priority_score || 0,
        }))
        setDbAds(mappedAds)
      }
    } catch (e) {
      console.error('Error fetching data from supabase', e)
    }
  }, [isProduction, searchCountry, searchState, searchCity])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  useEffect(() => {
    if (refreshIntervalMs > 0) {
      const interval = setInterval(() => {
        fetchAllData()
      }, refreshIntervalMs)
      return () => clearInterval(interval)
    }
  }, [refreshIntervalMs, fetchAllData])

  useEffect(() => {
    if (authUser && (searchQuery || selectedCategory !== 'all')) {
      const timer = setTimeout(() => {
        supabase
          .from('profiles')
          .update({
            last_search_context: {
              query: searchQuery,
              category: selectedCategory,
              timestamp: new Date().toISOString(),
            },
          })
          .eq('id', authUser.id)
          .then()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, selectedCategory, authUser])

  const handleRefresh = async () => {
    refreshCoupons()
    await fetchAllData()
  }

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/vendor')
    }
  }

  const handleCardClick = (id: string) => {
    trackSeasonalClick(id)
    navigate(`/voucher/${id}`)
  }

  const handleReserveSeasonal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    const success = reserveCoupon(id)
    if (success) {
      toast.success(
        t('voucher_detail.reserved_success', 'Voucher successfully reserved!'),
      )
    }
  }

  const searchLocationInfo = useMemo(() => {
    const sq = searchQuery.toLowerCase()
    if (!sq) return null

    for (const [key, data] of Object.entries(POPULAR_DESTINATIONS)) {
      if (
        sq.includes(key.toLowerCase()) ||
        sq.includes(data.label.toLowerCase())
      ) {
        return data
      }
    }
    return null
  }, [searchQuery])

  const activeLocationLabel = useMemo(() => {
    if (searchCity) return `${searchCity}, ${searchState || searchCountry}`
    if (searchState) return `${searchState}, ${searchCountry}`
    if (searchCountry) return searchCountry
    if (searchLocationInfo) return searchLocationInfo.label
    return null
  }, [searchCity, searchState, searchCountry, searchLocationInfo])

  const activeEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventsToUse =
      seasonalPromos.length > 0
        ? seasonalPromos.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            image: p.image_url,
            type: 'event',
            startDate: p.start_date || p.created_at,
            endDate: p.end_date,
            status: p.status === 'published' ? 'active' : p.status,
            offerType: 'online',
            externalUrl: p.product_link,
          }))
        : Array.isArray(seasonalEvents)
          ? seasonalEvents
          : []

    const safeReservedIds = Array.isArray(reservedIds) ? reservedIds : []

    return eventsToUse.filter((e) => {
      if (!e || e.status !== 'active') return false
      if (safeReservedIds.includes(e.id)) return false
      if (e.endDate) {
        const end = new Date(e.endDate)
        end.setHours(23, 59, 59, 999)
        return end >= today
      }
      return true
    })
  }, [seasonalEvents, seasonalPromos, reservedIds])

  const filteredCoupons = useMemo(() => {
    const safeCoupons = Array.isArray(coupons) ? coupons : []
    const safeDbCoupons = Array.isArray(dbCoupons) ? dbCoupons : []
    const safeReservedIds = Array.isArray(reservedIds) ? reservedIds : []

    const uniqueMap = new Map()
    const safeDbAds = Array.isArray(dbAds) ? dbAds : []

    for (let i = 0; i < safeDbCoupons.length; i++) {
      const c = safeDbCoupons[i]
      if (c && !uniqueMap.has(c.id)) uniqueMap.set(c.id, c)
    }
    for (let i = 0; i < safeCoupons.length; i++) {
      const c = safeCoupons[i]
      if (c && !uniqueMap.has(c.id)) uniqueMap.set(c.id, c)
    }
    for (let i = 0; i < safeDbAds.length; i++) {
      const c = safeDbAds[i]
      if (c && !uniqueMap.has(c.id)) uniqueMap.set(c.id, c)
    }

    const combined = Array.from(uniqueMap.values())

    let textToMatch = searchQuery.toLowerCase()
    if (searchLocationInfo) {
      textToMatch = textToMatch
        .replace(searchLocationInfo.label.toLowerCase(), '')
        .trim()
      Object.keys(POPULAR_DESTINATIONS).forEach((k) => {
        if (textToMatch.includes(k.toLowerCase())) {
          textToMatch = textToMatch.replace(k.toLowerCase(), '').trim()
        }
      })
    }

    const textAndCategoryFiltered = combined.filter((c) => {
      if (safeReservedIds.includes(c.id)) return false

      if (searchCountry && c.country && c.country !== searchCountry)
        return false
      if (searchState && c.state && c.state !== searchState) return false
      if (searchCity && c.city && c.city !== searchCity) return false

      const title = c.translations?.[language]?.title || c.title || ''
      const storeName = c.storeName || ''
      const category = c.category || ''

      const matchesText =
        textToMatch === '' ||
        title.toLowerCase().includes(textToMatch) ||
        storeName.toLowerCase().includes(textToMatch) ||
        category.toLowerCase().includes(textToMatch)

      if (!matchesText) return false

      let matchesCategory = selectedCategory === 'all'

      if (!matchesCategory && category) {
        const cCat = category.toLowerCase()
        const sCat = selectedCategory.toLowerCase()

        matchesCategory =
          cCat === sCat ||
          (sCat === 'electronics' &&
            (cCat.includes('eletr') ||
              cCat.includes('tech') ||
              cCat.includes('smartphone'))) ||
          (sCat === 'food' &&
            (cCat.includes('aliment') ||
              cCat.includes('comida') ||
              cCat.includes('restaurante'))) ||
          (sCat === 'fashion' &&
            (cCat.includes('moda') ||
              cCat.includes('roupa') ||
              cCat.includes('vestuário'))) ||
          ((sCat === 'travel' || sCat === 'cat-viagens') &&
            (cCat.includes('viagem') ||
              cCat.includes('turismo') ||
              cCat.includes('hotel') ||
              cCat.includes('travel'))) ||
          ((sCat === 'cat-hoteis' || sCat === 'hotels') &&
            (cCat.includes('hotel') ||
              cCat.includes('hospedagem') ||
              cCat.includes('resort') ||
              cCat.includes('pousada'))) ||
          (sCat === 'services' &&
            (cCat.includes('serviço') || cCat.includes('assinatura'))) ||
          cCat.includes(sCat) ||
          sCat.includes(cCat)
      }

      return matchesCategory
    })

    const baseLoc = searchLocationInfo || userLocation

    const withDistance = textAndCategoryFiltered.map((c) => {
      let dist = c.distance || 0
      if (baseLoc && c.coordinates && typeof c.coordinates.lat === 'number') {
        dist = Math.round(
          getDistanceFromLatLonInKm(
            baseLoc.lat,
            baseLoc.lng,
            c.coordinates.lat,
            c.coordinates.lng,
          ) * 1000,
        )
      }
      return { ...c, distance: dist }
    })

    const results = withDistance.filter((c) => {
      return searchLocationInfo ? (c.distance || 0) < 50000 : true
    })

    results.sort((a, b) => {
      const scoreA = a.source === 'ad' ? a.priority_score || 10 : 0
      const scoreB = b.source === 'ad' ? b.priority_score || 10 : 0

      if (scoreA !== scoreB) return scoreB - scoreA

      return (a.distance || 0) - (b.distance || 0)
    })

    return results
  }, [
    dbCoupons,
    coupons,
    dbAds,
    searchQuery,
    selectedCategory,
    reservedIds,
    language,
    searchLocationInfo,
    userLocation,
    searchCountry,
    searchState,
    searchCity,
  ])

  const filteredDbPromotions = useMemo(() => {
    return supabasePromos.filter((p) => {
      if (!p) return false

      if (searchCountry && p.country && p.country !== searchCountry)
        return false
      if (searchState && p.state && p.state !== searchState) return false
      if (searchCity && p.city && p.city !== searchCity) return false

      let textToMatch = searchQuery.toLowerCase()
      if (searchLocationInfo) {
        textToMatch = textToMatch
          .replace(searchLocationInfo.label.toLowerCase(), '')
          .trim()
        Object.keys(POPULAR_DESTINATIONS).forEach((k) => {
          if (textToMatch.includes(k.toLowerCase())) {
            textToMatch = textToMatch.replace(k.toLowerCase(), '').trim()
          }
        })
      }

      const matchesText =
        textToMatch === '' ||
        (p.title && p.title.toLowerCase().includes(textToMatch)) ||
        (p.storeName && p.storeName.toLowerCase().includes(textToMatch)) ||
        (p.store_name && p.store_name.toLowerCase().includes(textToMatch)) ||
        (p.category && p.category.toLowerCase().includes(textToMatch))

      let matchesCategory = selectedCategory === 'all'

      if (!matchesCategory && p.category) {
        const pCat = p.category.toLowerCase()
        const sCat = selectedCategory.toLowerCase()

        matchesCategory =
          pCat === sCat ||
          (sCat === 'electronics' &&
            (pCat.includes('eletr') ||
              pCat.includes('tech') ||
              pCat.includes('smartphone'))) ||
          (sCat === 'food' &&
            (pCat.includes('aliment') ||
              pCat.includes('comida') ||
              pCat.includes('restaurante'))) ||
          (sCat === 'fashion' &&
            (pCat.includes('moda') ||
              pCat.includes('roupa') ||
              pCat.includes('vestuário'))) ||
          ((sCat === 'travel' || sCat === 'cat-viagens') &&
            (pCat.includes('viagem') ||
              pCat.includes('turismo') ||
              pCat.includes('hotel') ||
              pCat.includes('travel'))) ||
          ((sCat === 'cat-hoteis' || sCat === 'hotels') &&
            (pCat.includes('hotel') ||
              pCat.includes('hospedagem') ||
              pCat.includes('resort') ||
              pCat.includes('pousada'))) ||
          (sCat === 'services' &&
            (pCat.includes('serviço') || pCat.includes('assinatura'))) ||
          pCat.includes(sCat) ||
          sCat.includes(pCat)
      }

      return matchesText && matchesCategory
    })
  }, [
    supabasePromos,
    searchQuery,
    selectedCategory,
    searchLocationInfo,
    searchCountry,
    searchState,
    searchCity,
  ])

  const safeFilteredCoupons = Array.isArray(filteredCoupons)
    ? filteredCoupons
    : []

  const trendingCoupons = safeFilteredCoupons.filter((c) => c && c.isFeatured)
  const finalTrending =
    trendingCoupons.length >= 4
      ? trendingCoupons.slice(0, 4)
      : [
          ...trendingCoupons,
          ...safeFilteredCoupons.filter((c) => !c.isFeatured),
        ].slice(0, 4)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedCategory, searchCountry, searchState, searchCity])

  const moreCouponsAll = useMemo(() => {
    return safeFilteredCoupons.filter(
      (c) => c && !finalTrending.find((tc) => tc.id === c.id),
    )
  }, [safeFilteredCoupons, finalTrending])

  const moreCoupons = moreCouponsAll.slice(0, page * itemsPerPage)
  const hasMoreCoupons = moreCouponsAll.length > page * itemsPerPage

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />
      case 'Shirt':
        return <Shirt className="w-4 h-4" />
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />
      case 'Ticket':
        return <Ticket className="w-4 h-4" />
      case 'ShoppingCart':
        return <ShoppingCart className="w-4 h-4" />
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />
      case 'CircleEllipsis':
        return <CircleEllipsis className="w-4 h-4" />
      case 'LayoutGrid':
      default:
        return <LayoutGrid className="w-4 h-4" />
    }
  }

  const mainCategoryIds =
    platformSettings?.mainCategories || CATEGORIES.slice(1, 5).map((c) => c.id)
  const mainCategories = CATEGORIES.filter(
    (c) => Array.isArray(mainCategoryIds) && mainCategoryIds.includes(c.id),
  ).slice(0, 4)
  const secondaryCategories = CATEGORIES.filter(
    (c) =>
      c.id !== 'all' &&
      (!Array.isArray(mainCategoryIds) || !mainCategoryIds.includes(c.id)),
  )
  const isSecondarySelected = secondaryCategories.some(
    (c) => c.id === selectedCategory,
  )

  return (
    <div className="min-h-screen pb-20 md:pb-8 animate-fade-in bg-slate-50/30 flex flex-col">
      <AdSpace position="top" className="border-b bg-white" />

      <section className="bg-white pt-4 pb-3 px-4 border-b shadow-sm">
        <div className="container mx-auto max-w-5xl relative">
          {(isMaster || isMerchantOrAdmin) && (
            <div className="absolute -top-2 right-0 z-10 hidden sm:flex gap-2 items-center">
              {isMerchantOrAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="shadow-md bg-white border-primary text-primary hover:bg-primary/5"
                >
                  <Link to="/merchant">
                    {t('nav.vendor', 'Área do Anunciante')}{' '}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              )}
              {isMaster && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="shadow-md bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                  >
                    <Link to="/admin?tab=publicidade">Publicidade</Link>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="shadow-md bg-slate-900 hover:bg-slate-800"
                  >
                    <Link to="/admin">
                      {t('nav.admin', 'Admin Dashboard')}{' '}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2.5 max-w-2xl mx-auto md:mx-0">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back', 'Back')}
              </Button>
              <div className="flex gap-2 sm:hidden flex-wrap justify-end">
                {isMerchantOrAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="shadow-md bg-white text-primary border-primary/20 h-8 text-xs px-2"
                  >
                    <Link to="/merchant">{t('nav.vendor', 'Anunciante')}</Link>
                  </Button>
                )}
                {isMaster && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="shadow-md bg-white border-slate-200 text-slate-800 hover:bg-slate-50 h-8 text-xs px-2"
                    >
                      <Link to="/admin?tab=publicidade">Ads</Link>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="shadow-md bg-slate-900 hover:bg-slate-800 h-8 text-xs px-2"
                    >
                      <Link to="/admin">Admin</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <HierarchicalLocationSelector
              country={searchCountry}
              state={searchState}
              city={searchCity}
              onChange={(c, s, ci) => {
                setSearchCountry(c)
                setSearchState(s)
                setSearchCity(ci)
              }}
            />

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'home.search_placeholder_new',
                  'Where are you going? Search hotels, parks, coupons...',
                )}
                className="pl-12 h-12 sm:h-14 text-base rounded-full shadow-sm bg-slate-50 border-slate-200 focus-visible:ring-primary/30 focus-visible:bg-white transition-all w-full"
              />
            </div>

            <div className="flex items-center justify-between pl-2 mt-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="hidden sm:flex text-slate-500 hover:text-primary transition-colors h-8 px-2 -ml-2"
                  title={t('home.refresh_promotions', 'Refresh Promotions')}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 animate-fade-in">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>
                    {activeLocationLabel
                      ? t(
                          'home.location_override',
                          `Showing offers in {location}`,
                        ).replace('{location}', activeLocationLabel)
                      : userLocation
                        ? t('home.location_active', 'Showing offers near you')
                        : t('home.detecting_location', 'Detecting location...')}
                  </span>
                </div>
              </div>
              {isSearchingWeb && (
                <div className="text-xs text-primary animate-pulse flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {t('home.searching_web', 'Searching the web...')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 mt-6 flex-1">
        <div className="mb-8">
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-3 px-1 items-center">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={cn(
                  'rounded-full px-5 transition-all duration-300',
                  selectedCategory === 'all'
                    ? 'shadow-md shadow-primary/20 scale-105'
                    : 'hover:border-primary/50 hover:bg-primary/5 text-slate-600 bg-white',
                )}
                onClick={() => setSelectedCategory('all')}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="ml-2 font-medium">
                  {t('category.all', 'All')}
                </span>
              </Button>

              {Array.isArray(mainCategories) &&
                mainCategories.map((cat) => {
                  const isActive = selectedCategory === cat.id
                  return (
                    <Button
                      key={cat.id}
                      variant={isActive ? 'default' : 'outline'}
                      className={cn(
                        'rounded-full px-5 transition-all duration-300',
                        isActive
                          ? 'shadow-md shadow-primary/20 scale-105'
                          : 'hover:border-primary/50 hover:bg-primary/5 text-slate-600 bg-white',
                      )}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {getCategoryIcon(cat.icon)}
                      <span className="ml-2 font-medium">
                        {t(cat.translationKey, cat.label)}
                      </span>
                    </Button>
                  )
                })}

              {Array.isArray(secondaryCategories) &&
                secondaryCategories.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isSecondarySelected ? 'default' : 'outline'}
                        className={cn(
                          'rounded-full px-5 transition-all duration-300',
                          isSecondarySelected
                            ? 'shadow-md shadow-primary/20 scale-105'
                            : 'hover:border-primary/50 hover:bg-primary/5 text-slate-600 bg-white',
                        )}
                      >
                        <CircleEllipsis className="w-4 h-4" />
                        <span className="ml-2 font-medium">
                          {isSecondarySelected
                            ? t(
                                secondaryCategories.find(
                                  (c) => c.id === selectedCategory,
                                )?.translationKey || 'category.others',
                                'Others',
                              )
                            : t('category.others', 'Others')}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {Array.isArray(secondaryCategories) &&
                        secondaryCategories.map((cat) => (
                          <DropdownMenuItem
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="cursor-pointer"
                          >
                            {getCategoryIcon(cat.icon)}
                            <span className="ml-2">
                              {t(cat.translationKey, cat.label)}
                            </span>
                            {selectedCategory === cat.id && (
                              <Check className="ml-auto w-4 h-4 text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        <div className="space-y-10">
          {isLoadingLocation ? (
            <div className="py-12 space-y-8 animate-pulse">
              <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">
                  {t(
                    'home.loading_deals',
                    'Searching for the best deals for you...',
                  )}
                </p>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-md" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-72 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          ) : hasErrorLoading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-red-200 shadow-sm mt-8">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {t('home.load_failed', 'Failed to load coupons')}
              </h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto px-4">
                {t(
                  'home.load_failed_desc',
                  'We had a communication problem with our servers. Please check your connection or try again.',
                )}
              </p>
              <Button
                variant="default"
                className="mt-6 font-semibold"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('common.try_again', 'Try again')}
              </Button>
            </div>
          ) : (
            <>
              {Array.isArray(activeEvents) &&
                activeEvents.length > 0 &&
                !searchQuery &&
                selectedCategory === 'all' && (
                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Gift className="h-6 w-6 text-primary" />
                        {t('home.seasonal_events', 'Featured Seasonal Offers')}
                      </h2>
                      <Button
                        variant="ghost"
                        asChild
                        className="hidden sm:flex hover:bg-slate-100"
                      >
                        <Link to="/seasonal">
                          {t('home.view_calendar', 'View calendar')}{' '}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {activeEvents.slice(0, 2).map((event) => {
                        if (!event) return null
                        const eventTitle =
                          event.translations?.[language]?.title ||
                          event.title ||
                          ''
                        const eventDesc =
                          event.translations?.[language]?.description ||
                          event.description ||
                          ''

                        return (
                          <Card
                            key={event.id}
                            className="overflow-hidden border-primary/20 hover:border-primary/50 transition-all hover:shadow-md group cursor-pointer"
                            onClick={() => handleCardClick(event.id)}
                          >
                            <div className="flex flex-col sm:flex-row h-full">
                              {event.image && (
                                <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-slate-100 shrink-0">
                                  {!imgErrors[event.id] ? (
                                    <img
                                      src={event.image}
                                      alt={eventTitle}
                                      crossOrigin="anonymous"
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                      onError={() =>
                                        setImgErrors((prev) => ({
                                          ...prev,
                                          [event.id]: true,
                                        }))
                                      }
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                      <ImageOff className="h-8 w-8 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="absolute top-2 left-2 flex gap-1 flex-col items-start">
                                    <Badge
                                      variant="secondary"
                                      className="bg-white/95 text-black backdrop-blur-sm shadow-sm font-bold capitalize"
                                    >
                                      {t(
                                        `event.type.${event.type}`,
                                        event.type || 'Event',
                                      )}
                                    </Badge>
                                    {(event.offerType === 'online' ||
                                      event.externalUrl) && (
                                      <Badge className="bg-blue-600 text-white font-bold shadow-sm border-none">
                                        <Globe className="w-3 h-3 mr-1" />{' '}
                                        {t('vouchers.online', 'Online')}
                                      </Badge>
                                    )}{' '}
                                  </div>
                                </div>
                              )}
                              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                                <div>
                                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-1.5 line-clamp-2">
                                    {eventTitle}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-4">
                                    {eventDesc}
                                  </p>
                                </div>
                                <div className="space-y-4 mt-auto">
                                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                                    <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate">
                                      {event.startDate
                                        ? formatDate(event.startDate)
                                        : ''}{' '}
                                      -{' '}
                                      {event.endDate
                                        ? formatDate(event.endDate)
                                        : ''}
                                    </span>
                                  </div>
                                  <Button
                                    className="w-full gap-2 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                                    size="lg"
                                    onClick={(e) =>
                                      handleReserveSeasonal(e, event.id)
                                    }
                                  >
                                    <Ticket className="h-5 w-5" />
                                    {t('home.get_voucher', 'Get Voucher')}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                    {Array.isArray(activeEvents) && activeEvents.length > 2 && (
                      <div className="mt-5 text-center sm:hidden">
                        <Button variant="outline" asChild className="w-full">
                          <Link to="/seasonal">
                            {t('home.view_all_events', 'View all events')}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </section>
                )}

              {Array.isArray(finalTrending) && finalTrending.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-5 text-slate-800">
                    <MapPin className="h-6 w-6 text-primary" />
                    {searchQuery || selectedCategory !== 'all'
                      ? t('home.search_results', 'Search Results')
                      : t('home.nearby_offers', 'Offers Near You')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {finalTrending.map((coupon) =>
                      coupon ? (
                        <CouponCard
                          key={coupon.id || Math.random().toString()}
                          coupon={coupon}
                        />
                      ) : null,
                    )}
                  </div>
                </section>
              )}

              {Array.isArray(moreCoupons) && moreCoupons.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-5 text-slate-800">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    {t('home.more_deals', 'More Opportunities')}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {moreCoupons.map((coupon) =>
                      coupon ? (
                        <CouponCard
                          key={coupon.id || Math.random().toString()}
                          coupon={coupon}
                          variant="horizontal"
                        />
                      ) : null,
                    )}
                  </div>
                  {hasMoreCoupons && (
                    <div className="mt-8 text-center">
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full px-8 bg-white border-slate-200 shadow-sm hover:bg-slate-50 font-medium"
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('common.load_more', 'Load more')}
                      </Button>
                    </div>
                  )}
                </section>
              )}

              {Array.isArray(filteredDbPromotions) &&
                filteredDbPromotions.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-5 text-slate-800">
                      <Globe className="h-6 w-6 text-blue-500" />
                      {t('home.web_promotions', 'Curated Web Offers')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {filteredDbPromotions.map((promo) => {
                        if (!promo || typeof promo !== 'object') return null

                        return (
                          <PromotionCard
                            key={promo.id || Math.random().toString()}
                            promotion={promo}
                          />
                        )
                      })}
                    </div>
                  </section>
                )}

              {Array.isArray(filteredCoupons) &&
                filteredCoupons.length === 0 &&
                Array.isArray(filteredDbPromotions) &&
                filteredDbPromotions.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">
                      {searchQuery || selectedCategory !== 'all'
                        ? t(
                            'home.no_offers',
                            'No offers found for this category',
                          )
                        : t(
                            'home.no_coupons_available',
                            'No offers available right now.',
                          )}
                    </h3>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto px-4">
                      {selectedCategory !== 'all' && !searchQuery
                        ? t(
                            'home.no_category_results',
                            'We have no offers available in this category right now.',
                          )
                        : searchQuery
                          ? t(
                              'home.try_another_search',
                              'Try other search terms or browse available categories.',
                            )
                          : t(
                              'home.check_back_later',
                              'Check back later for new promotions or try refreshing the page.',
                            )}
                    </p>
                    <div className="flex justify-center flex-wrap gap-3 mt-6">
                      {(searchQuery || selectedCategory !== 'all') && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                          }}
                        >
                          {t('home.clear_search', 'Clear Search and Filters')}
                        </Button>
                      )}
                      <Button
                        variant={
                          searchQuery || selectedCategory !== 'all'
                            ? 'ghost'
                            : 'default'
                        }
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('home.refresh_promotions', 'Refresh Promotions')}
                      </Button>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      <div className="mt-12 w-full">
        <AdSpace position="bottom" className="border-t bg-white" />
      </div>
    </div>
  )
}

export default function Index() {
  return (
    <ErrorBoundary>
      <IndexContent />
    </ErrorBoundary>
  )
}
