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
            .in('status', ['published', 'approved', 'active', 'Encerrada'])
            .eq('environment', currentEnv)
            .order('captured_at', { ascending: false })
            .limit(100),
          supabase
            .from('ad_campaigns')
            .select('*')
            .in('status', ['active', 'published'])
            .eq('environment', currentEnv)
            .order('priority_score', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
            .limit(50),
        ])

        if (promosRes.data) {
          setDiscoveredPromotions(
            promosRes.data.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description || '',
              category: p.category || 'General',
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
              externalUrl: p.product_link || p.source_url,
              currency: p.currency || 'BRL',
              isDiscovered: true,
              expiryDate: p.end_date,
              usageCount: p.usage_count || 0,
              isVerified: p.is_verified || false,
              promotionModel: p.promotion_model,
              rewardDescription: p.reward_description,
              engagementThreshold: p.engagement_threshold,
              rewardType: p.reward_type,
              rewardValue: p.reward_value,
              isSeasonal: p.is_seasonal,
              coordinates: { lat: p.latitude, lng: p.longitude },
              alertRadius: p.alert_radius,
            })),
          )
        }

        if (adsRes.data) {
          setAdCampaigns(
            adsRes.data.map((ad: any) => ({
              id: ad.id,
              title: ad.title,
              description: ad.description || '',
              category: ad.category || 'General',
              storeName: ad.company_name || 'Sponsored',
              image: ad.image,
              status: 'active',
              link: ad.link,
              externalUrl: ad.link,
              isFeatured: true,
              price: ad.price,
              originalPrice: ad.original_price,
              discount: ad.discount_percentage
                ? `${ad.discount_percentage}% OFF`
                : undefined,
              currency: ad.currency || 'BRL',
              promotionModel: ad.promotion_model || 'standard',
              rewardDescription: ad.reward_description,
              coordinates: { lat: ad.latitude, lng: ad.longitude },
              priority_score: ad.priority_score || 0,
              source: 'ad',
              expiryDate: ad.end_date,
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
      { id: 'all', label: t('common.all', 'All') },
      ...activeCats.map((c: any) => ({
        id: c.id,
        label: t(`category.${c.name}`, c.label),
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
            label: t(
              `category.${catId}`,
              p.category.charAt(0).toUpperCase() + p.category.slice(1),
            ),
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
  const [userEngagements, setUserEngagements] = useState<
    Record<string, number>
  >({})

  useEffect(() => {
    if (user) {
      supabase
        .from('user_engagements')
        .select('campaign_id, action_type')
        .eq('user_id', user.id)
        .eq('action_type', 'social_share')
        .then(({ data }) => {
          if (data) {
            const counts: Record<string, number> = {}
            data.forEach((d) => {
              if (d.campaign_id) {
                counts[d.campaign_id] = (counts[d.campaign_id] || 0) + 1
              }
            })
            setUserEngagements(counts)
          }
        })
    }
  }, [user])

  const handleShare = async (campaignId: string) => {
    if (!user) return
    const { error } = await supabase.from('user_engagements').insert({
      user_id: user.id,
      campaign_id: campaignId,
      action_type: 'social_share',
    })
    if (!error) {
      setUserEngagements((prev) => ({
        ...prev,
        [campaignId]: (prev[campaignId] || 0) + 1,
      }))
    }
  }

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
        c.status === 'published' ||
        c.status === 'Encerrada',
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

    // 6. Location processing & Priority Boosting
    if (userLocation) {
      processed = processed.map((c) => {
        let distance = c.distance || null
        let priority_score = c.priority_score || 0

        if (
          c.coordinates?.lat &&
          c.coordinates?.lng &&
          !isNaN(Number(c.coordinates.lat)) &&
          !isNaN(Number(c.coordinates.lng))
        ) {
          distance =
            getDistance(
              userLocation.lat,
              userLocation.lng,
              Number(c.coordinates.lat),
              Number(c.coordinates.lng),
            ) * 1000

          if (c.promotionModel === 'pre-launch' && c.isSeasonal) {
            if (distance < (c.alertRadius || 10000)) {
              priority_score += 50 // Boost
            }
          }
        }
        return {
          ...c,
          distance,
          priority_score:
            c.source === 'ad' ? c.priority_score || 10 : priority_score,
        }
      })
    }

    // 7. Sorting
    if (sortBy === 'distance') {
      processed.sort((a, b) => {
        const scoreA = a.priority_score || 0
        const scoreB = b.priority_score || 0
        if (scoreA !== scoreB) return scoreB - scoreA
        return (a.distance || 999999) - (b.distance || 999999)
      })
    } else {
      // Recommended sort
      processed.sort((a, b) => {
        const scoreA = a.priority_score || 0
        const scoreB = b.priority_score || 0
        return scoreB - scoreA
      })
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
            {t('nav.explore', 'Explore')}
          </h1>
          <div className="text-slate-500 mt-1 flex items-center gap-2">
            {loading && page === 1 ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <span>
                {total} {t('explore.offers_found', 'offers found')}
              </span>
            )}
            {userLocation && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-primary" />{' '}
                {t('explore.active_location', 'Active Location')}
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
            {t('explore.view_list', 'List')}
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="shadow-sm"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            {t('explore.view_map', 'Map')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('explore.search_placeholder', 'Search coupons...')}
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white shadow-sm">
              <SelectValue placeholder={t('common.sort_by', 'Sort by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">
                {t('explore.recommended', 'Recommended')}
              </SelectItem>
              <SelectItem value="distance">
                {t('explore.closest', 'Closest')}
              </SelectItem>
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
              const isPreLaunch = coupon.promotionModel === 'pre-launch'
              const shares = isPreLaunch ? userEngagements[coupon.id] || 0 : 0
              const threshold = coupon.engagementThreshold || 1
              const progress = Math.min((shares / threshold) * 100, 100)

              const cardContent = (
                <div className="relative h-full flex flex-col group">
                  <CouponCard coupon={coupon} variant="vertical" />
                  {isPreLaunch && (
                    <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <div className="flex justify-between text-xs mb-1 font-semibold text-indigo-800">
                        <span>
                          {t('explore.prelaunch_goal', 'Pre-launch Goal:')}{' '}
                          {shares}/{threshold} {t('explore.shares', 'shares')}
                        </span>
                        {shares >= threshold && (
                          <span className="text-green-600">
                            {t('explore.reward_unlocked', 'Reward Unlocked!')}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-indigo-600 font-medium">
                          {t('explore.reward', 'Reward:')} {coupon.rewardType} (
                          {coupon.rewardValue})
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 px-2 text-xs bg-white shadow-sm hover:bg-slate-50 text-indigo-700"
                          onClick={() => handleShare(coupon.id)}
                        >
                          {t('explore.share_to_unlock', 'Share to Unlock')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )

              if (index === displayCoupons.length - 1) {
                return (
                  <div ref={lastElementRef} key={coupon.id} className="h-full">
                    {cardContent}
                  </div>
                )
              }
              return (
                <div key={coupon.id} className="h-full">
                  {cardContent}
                </div>
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
                  'Interactive map view coming soon.',
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
              {t('explore.empty_title', 'No offers found')}
            </h3>
            <p className="text-slate-500">
              {t(
                'explore.none_desc',
                'Try adjusting the filters or search for other terms.',
              )}
            </p>
          </div>
        )}
      </div>

      <AdSpace position="bottom" className="mt-4" />
    </div>
  )
}
