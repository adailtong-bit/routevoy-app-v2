import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search, Map as MapIcon, List, Filter, MapPin } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CouponCard } from '@/components/CouponCard'
import { AdSpace } from '@/components/AdSpace'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function Explore() {
  const { t, language } = useLanguage()
  const { user, selectedRegion, coupons, platformSettings } = useCouponStore()
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [discoveredPromotions, setDiscoveredPromotions] = useState<any[]>([])
  const [adCampaigns, setAdCampaigns] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isProd =
          window.location.hostname === 'routevoy.com' ||
          window.location.hostname === 'www.routevoy.com'
        const currentEnv = isProd ? 'production' : 'development'

        const [promosRes, adsRes] = await Promise.all([
          supabase
            .from('discovered_promotions')
            .select('*')
            .in('status', ['published', 'approved', 'active'])
            .eq('environment', currentEnv)
            .order('captured_at', { ascending: false })
            .limit(100),
          supabase
            .from('ad_campaigns')
            .select('*')
            .eq('status', 'active')
            .eq('environment', currentEnv)
            .order('created_at', { ascending: false })
            .limit(50),
        ])

        if (promosRes.data) {
          setDiscoveredPromotions(
            promosRes.data.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description || '',
              category: p.category || 'Geral',
              storeName: p.store_name || '',
              image: p.image_url,
              imageUrl: p.image_url,
              discount: p.discount,
              price: p.price,
              originalPrice: p.original_price,
              status: p.status === 'published' ? 'active' : p.status,
              link: p.product_link,
              url: p.product_link,
              sourceUrl: p.source_url,
              isDiscovered: true,
              expiryDate: p.end_date,
              usageCount: p.usage_count || 0,
              isVerified: p.is_verified || false,
            })),
          )
        }

        if (adsRes.data) {
          setAdCampaigns(
            adsRes.data.map((ad: any) => ({
              id: ad.id,
              title: ad.title,
              description: ad.description || '',
              category: ad.category || 'Geral',
              storeName: 'Patrocinado',
              image: ad.image,
              status: 'active',
              link: ad.link,
              isFeatured: true,
              price: ad.price,
            })),
          )
        }
      } catch (e) {
        console.warn('Erro ao carregar ofertas da base', e)
      }
    }
    fetchData()
  }, [])

  const normalizeStr = (str: string) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()

  const dynamicCategories = useMemo(() => {
    const cats = platformSettings?.categories || []
    const activeCats = cats.filter((c: any) => c.status === 'active')

    const baseCats = [
      { id: 'all', label: 'Todas' },
      ...activeCats.map((c: any) => ({
        id: c.id,
        label: c.label,
      })),
    ]

    const existingIds = new Set(baseCats.map((c) => c.id.toLowerCase()))
    const existingLabels = new Set(baseCats.map((c) => c.label.toLowerCase()))

    discoveredPromotions.forEach((p) => {
      if (p.category && p.category !== 'all') {
        const catId = normalizeStr(p.category).replace(/\s+/g, '-')
        if (
          !existingIds.has(catId) &&
          !existingLabels.has(p.category.toLowerCase())
        ) {
          baseCats.push({
            id: catId,
            label: p.category.charAt(0).toUpperCase() + p.category.slice(1),
          })
          existingIds.add(catId)
          existingLabels.add(p.category.toLowerCase())
        }
      }
    })

    return baseCats
  }, [platformSettings?.categories, discoveredPromotions])

  const [sortBy, setSortBy] = useState<'recommended' | 'distance'>(
    'recommended',
  )
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const itemsPerPage = 24

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.warn('Geolocation error:', err),
      )
    }
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(handler)
  }, [search])

  const filteredCoupons = useMemo(() => {
    let processed = [...coupons, ...discoveredPromotions, ...adCampaigns]

    // 1. Status Filter: Only show active/approved/published coupons
    processed = processed.filter(
      (c) =>
        c.status === 'active' ||
        c.status === 'approved' ||
        c.status === 'published',
    )

    // 2. Expiration Filter
    const now = new Date()
    processed = processed.filter((c) => {
      if (!c.expiryDate) return true
      const exp = new Date(c.expiryDate)
      return exp > now
    })

    // 3. Franchise Filter
    if (user?.franchiseId) {
      processed = processed.filter(
        (c) => !c.franchiseId || c.franchiseId === user.franchiseId,
      )
    }

    // 4. Category Filter (Robust text matching for user defined categories like "Eletrônico")
    if (selectedCategory !== 'all') {
      const categoryObj = dynamicCategories.find(
        (c) => c.id === selectedCategory,
      )
      const labelToMatch = categoryObj ? categoryObj.label : selectedCategory

      const matchCat = normalizeStr(labelToMatch)
      const idCat = normalizeStr(selectedCategory)

      processed = processed.filter((c) => {
        if (!c.category) return false
        const cCat = normalizeStr(c.category)

        let matches =
          cCat === matchCat ||
          cCat === idCat ||
          cCat.includes(matchCat) ||
          matchCat.includes(cCat) ||
          cCat.includes(idCat) ||
          idCat.includes(cCat)

        // Enhance matching for typical specific categories like hotels and travel
        if (!matches) {
          if (
            (idCat === 'cat-viagens' || idCat === 'travel') &&
            (cCat.includes('viagem') ||
              cCat.includes('turismo') ||
              cCat.includes('hotel') ||
              cCat.includes('travel'))
          )
            matches = true
          if (
            (idCat === 'cat-hoteis' || idCat === 'hotels') &&
            (cCat.includes('hotel') ||
              cCat.includes('hospedagem') ||
              cCat.includes('resort') ||
              cCat.includes('pousada'))
          )
            matches = true
          if (
            idCat === 'electronics' &&
            (cCat.includes('eletr') ||
              cCat.includes('tech') ||
              cCat.includes('smartphone'))
          )
            matches = true
          if (
            idCat === 'food' &&
            (cCat.includes('aliment') ||
              cCat.includes('comida') ||
              cCat.includes('restaurante'))
          )
            matches = true
          if (
            idCat === 'fashion' &&
            (cCat.includes('moda') ||
              cCat.includes('roupa') ||
              cCat.includes('vestuário'))
          )
            matches = true
          if (
            idCat === 'services' &&
            (cCat.includes('serviço') || cCat.includes('assinatura'))
          )
            matches = true
        }

        return matches
      })
    }

    // 5. Search Filter
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      processed = processed.filter((c) => {
        const title = (
          c.translations?.[language]?.title ||
          c.title ||
          ''
        ).toLowerCase()
        const desc = (
          c.translations?.[language]?.description ||
          c.description ||
          ''
        ).toLowerCase()
        const store = (c.storeName || '').toLowerCase()
        return title.includes(q) || desc.includes(q) || store.includes(q)
      })
    }

    // 6. Location processing
    if (userLocation) {
      processed = processed.map((c) => {
        if (c.coordinates?.lat && c.coordinates?.lng) {
          return {
            ...c,
            distance:
              getDistance(
                userLocation.lat,
                userLocation.lng,
                c.coordinates.lat,
                c.coordinates.lng,
              ) * 1000,
          }
        }
        return c
      })
    }

    // 7. Sorting
    if (sortBy === 'distance') {
      processed.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return processed
  }, [
    coupons,
    discoveredPromotions,
    selectedCategory,
    debouncedSearch,
    language,
    userLocation,
    sortBy,
    user?.franchiseId,
    dynamicCategories,
  ])

  const displayCoupons = useMemo(() => {
    return filteredCoupons.slice(0, page * itemsPerPage).map((coupon) => {
      const catObj = dynamicCategories.find((c) => c.id === coupon.category)
      if (catObj) {
        return { ...coupon, category: catObj.label }
      }
      return coupon
    })
  }, [filteredCoupons, page, dynamicCategories])

  const hasMore = displayCoupons.length < filteredCoupons.length
  const total = filteredCoupons.length

  useEffect(() => {
    setLoading(true)
    setPage(1)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [
    debouncedSearch,
    selectedCategory,
    selectedRegion,
    coupons,
    discoveredPromotions,
  ])

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  return (
    <div className="container max-w-6xl py-6 animate-fade-in-up flex flex-col gap-6">
      <AdSpace position="top" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t('nav.explore', 'Explorar')}
          </h1>
          <div className="text-slate-500 mt-1 flex items-center gap-2">
            {loading && page === 1 ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <span>
                {total} {t('explore.offers_found', 'ofertas encontradas')}
              </span>
            )}
            {userLocation && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-primary" /> Localização Ativa
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="shadow-sm"
          >
            <List className="h-4 w-4 mr-2" />
            {t('explore.view_list', 'Lista')}
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="shadow-sm"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            {t('explore.view_map', 'Mapa')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('explore.search_placeholder', 'Buscar cupons...')}
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white shadow-sm">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recomendados</SelectItem>
              <SelectItem value="distance">Mais Próximos</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-white shadow-sm"
          >
            <Filter className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {dynamicCategories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'whitespace-nowrap rounded-full font-medium transition-colors shadow-sm',
              selectedCategory !== cat.id &&
                'bg-white hover:bg-slate-50 text-slate-600',
            )}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div
        className={cn(
          'grid gap-4 sm:gap-6 lg:gap-8',
          viewMode === 'list'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1',
        )}
      >
        {viewMode === 'list' ? (
          <>
            {displayCoupons.map((coupon, index) => {
              if (index === displayCoupons.length - 1) {
                return (
                  <div ref={lastElementRef} key={coupon.id} className="h-full">
                    <CouponCard coupon={coupon} variant="vertical" />
                  </div>
                )
              }
              return (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  variant="vertical"
                />
              )
            })}

            {loading && (
              <>
                {Array.from({ length: page === 1 ? 12 : 4 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex flex-col h-full rounded-xl border border-slate-200/60 overflow-hidden bg-white shadow-sm min-h-[280px]"
                  >
                    <Skeleton className="h-36 sm:h-44 w-full rounded-none" />
                    <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-11 sm:h-10 w-full rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <div className="h-[400px] w-full bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner">
            <div className="text-center flex flex-col items-center gap-3">
              <MapIcon className="h-10 w-10 text-slate-400" />
              <p className="text-slate-500 font-medium">
                {t(
                  'explore.map_coming_soon',
                  'Visualização do mapa interativa em breve.',
                )}
              </p>
            </div>
          </div>
        )}

        {!loading && displayCoupons.length === 0 && viewMode === 'list' && (
          <div className="col-span-full py-16 text-center bg-white rounded-lg border border-slate-100 border-dashed">
            <div className="flex justify-center mb-4">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              {t(
                'explore.empty_title',
                'Nenhuma oferta encontrada para esta categoria',
              )}
            </h3>
            <p className="text-slate-500">
              {t(
                'explore.none_desc',
                'Tente ajustar os filtros, buscar por outros termos ou ver todas as ofertas disponíveis.',
              )}
            </p>
          </div>
        )}
      </div>

      <AdSpace position="bottom" className="mt-4" />
    </div>
  )
}
