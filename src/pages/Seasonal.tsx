import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { useAuth } from '@/hooks/use-auth'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  Gift,
  Store,
  Ticket,
  Clock,
  Search,
  Loader2,
  Share2,
} from 'lucide-react'
import { toast } from 'sonner'
import { SeasonalEvent, DiscoveredPromotion } from '@/lib/types'
import { searchAffiliateDeals } from '@/services/affiliates'
import { PromotionCard } from '@/components/PromotionCard'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'

const groupEventsByMonth = (events: any[]) => {
  const grouped: Record<string, any[]> = {}

  const sorted = [...events].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
    return dateA - dateB
  })

  sorted.forEach((e) => {
    const d = e.startDate ? new Date(e.startDate) : new Date()
    const monthYear = format(d, 'MMMM yyyy')
    if (!grouped[monthYear]) {
      grouped[monthYear] = []
    }
    grouped[monthYear].push(e)
  })

  return grouped
}

function SeasonalCampaignCard({
  event,
  isFuture,
}: {
  event: SeasonalEvent
  isFuture: boolean
}) {
  const { t, formatDate, language } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, reserveCoupon, isReserved, companies, trackSeasonalClick } =
    useCouponStore()

  const reserved = isReserved(event.id)
  const isSoldOut =
    event.totalAvailable !== undefined && event.totalAvailable <= 0
  const title = event.translations?.[language]?.title || event.title
  const description =
    event.translations?.[language]?.description || event.description
  const companyName = companies.find((c) => c.id === event.companyId)?.name

  const [engagementCount, setEngagementCount] = useState(0)

  useEffect(() => {
    if (user && event.engagementThreshold) {
      supabase
        .from('user_engagements')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', event.id)
        .eq('user_id', user.id)
        .eq('action_type', 'social_share')
        .then(({ count }) => setEngagementCount(count || 0))
    }
  }, [user, event.id, event.engagementThreshold])

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    try {
      await supabase.from('user_engagements').insert({
        campaign_id: event.id,
        user_id: user.id,
        action_type: 'social_share',
      })

      const newCount = engagementCount + 1
      setEngagementCount(newCount)

      if (event.engagementThreshold && newCount === event.engagementThreshold) {
        toast.success(
          t(
            'seasonal.reward_unlocked',
            'Target reached! Your reward voucher has been generated.',
          ),
        )
      } else {
        toast.success(
          t('seasonal.shared', 'Shared successfully! Progress updated.'),
        )
      }
    } catch (err) {
      toast.error('Failed to record share')
    }
  }

  const handleReserve = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    if (isFuture || reserved || isSoldOut) return

    const success = reserveCoupon(event.id)
    if (success) {
      trackSeasonalClick(event.id)
      toast.success(
        t(
          'seasonal.reserved_success',
          'Voucher da campanha reservado com sucesso!',
        ),
      )
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow h-full">
      {event.image && (
        <div className="relative h-48 w-full bg-muted shrink-0">
          <img
            src={event.image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {event.type && (
              <Badge
                variant="secondary"
                className="bg-white/90 text-black border-none shadow-sm font-semibold capitalize"
              >
                {t(`event.type.${event.type}`, event.type)}
              </Badge>
            )}
          </div>
          {isSoldOut && !isFuture && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="shadow-sm">
                {t('seasonal.exhausted', 'Esgotado')}
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {title}
        </CardTitle>
        {companyName && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Store className="h-3 w-3" />
            {companyName}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>
        <div className="space-y-2 mt-auto">
          <div className="flex items-center text-xs text-muted-foreground gap-1.5 font-medium">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>
          {event.totalAvailable !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-orange-500" />
              <span>
                {event.totalAvailable}{' '}
                {t('seasonal.vouchers_left', 'restantes')}
              </span>
            </div>
          )}
        </div>

        {event.engagementThreshold && event.engagementThreshold > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-700">
                Engagement Reward
              </span>
              <span className="text-xs font-bold text-primary">
                {engagementCount} / {event.engagementThreshold}
              </span>
            </div>
            <Progress
              value={(engagementCount / event.engagementThreshold) * 100}
              className="h-2 mb-2"
            />
            <p
              className="text-[11px] text-slate-500 line-clamp-1"
              title={event.rewardDescription || ''}
            >
              {event.rewardDescription || 'Share to unlock a reward!'}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2 h-7 text-xs font-semibold bg-white"
              onClick={handleShare}
              disabled={
                engagementCount >= event.engagementThreshold || isFuture
              }
            >
              <Share2 className="w-3 h-3 mr-1.5" />
              {engagementCount >= event.engagementThreshold
                ? 'Reward Unlocked'
                : 'Share to Progress'}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 mt-auto flex gap-2">
        <Button
          className="flex-1 transition-transform active:scale-95"
          variant={isFuture ? 'secondary' : reserved ? 'outline' : 'default'}
          disabled={isFuture || isSoldOut || reserved}
          onClick={handleReserve}
        >
          {isFuture ? (
            <>
              <Clock className="w-4 h-4 mr-2" />{' '}
              {t('seasonal.coming_soon', 'Em breve')}
            </>
          ) : reserved ? (
            <>{t('seasonal.reserved', 'Reservado')}</>
          ) : isSoldOut ? (
            <>{t('seasonal.exhausted_btn', 'Vouchers Esgotados')}</>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />{' '}
              {t('seasonal.reserve_voucher', 'Reservar Voucher')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function Seasonal() {
  const { t } = useLanguage()
  const { seasonalEvents, companies, user, selectedRegion } = useCouponStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [organicDeals, setOrganicDeals] = useState<DiscoveredPromotion[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const [dbSeasonal, setDbSeasonal] = useState<any[]>([])

  useEffect(() => {
    const fetchSeasonalPromos = async () => {
      try {
        const isProd =
          window.location.hostname === 'routevoy.com' ||
          window.location.hostname === 'www.routevoy.com'
        const currentEnv = isProd ? 'production' : 'development'

        const { data } = await supabase
          .from('discovered_promotions')
          .select('*')
          .eq('is_seasonal', true)
          .in('status', ['published', 'approved', 'active'])
          .eq('environment', currentEnv)

        if (data) {
          setDbSeasonal(
            data.map((p) => ({
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
              totalAvailable: p.total_limit,
              companyId: p.company_id,
              region: p.region,
              engagementThreshold: p.engagement_threshold,
              rewardType: p.reward_type,
              rewardValue: p.reward_value,
              rewardDescription: p.reward_description,
              rewardScope: p.reward_scope,
            })),
          )
        }
      } catch (err) {
        console.error('Error fetching seasonal events from DB', err)
      }
    }
    fetchSeasonalPromos()

    const fetchDefault = async () => {
      setIsSearching(true)
      try {
        const results = await searchAffiliateDeals('ofertas', 12)
        setOrganicDeals(results)
        setHasSearched(true)
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }
    fetchDefault()
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    try {
      const results = await searchAffiliateDeals(searchQuery, 12)
      setOrganicDeals(results)
    } catch (error) {
      toast.error(t('seasonal.search_error', 'Erro ao buscar ofertas'))
    } finally {
      setIsSearching(false)
    }
  }

  const filteredEvents = useMemo(() => {
    const allEvents = dbSeasonal.length > 0 ? dbSeasonal : seasonalEvents

    return allEvents.filter((e) => {
      if (
        user?.role === 'user' &&
        (e.status === 'draft' ||
          e.status === 'archived' ||
          e.status === 'rejected' ||
          e.status === 'expired')
      ) {
        return false
      }
      if (e.status === 'expired') return false

      let audienceMatch = true
      if (e.targetAudience === 'preferred') {
        const company = companies.find((comp) => comp.id === e.companyId)
        const isMerchant =
          user?.role === 'super_admin' ||
          (user?.role === 'shopkeeper' && user.companyId === e.companyId) ||
          (user?.role === 'franchisee' && user.franchiseId === e.franchiseId)
        const isPreferred = company?.preferredCustomers?.includes(
          user?.id || '',
        )
        audienceMatch = isMerchant || !!isPreferred
      }

      if (
        user?.role === 'shopkeeper' &&
        e.companyId &&
        e.companyId !== user.companyId
      ) {
        return false
      }
      if (
        user?.role === 'franchisee' &&
        e.franchiseId &&
        e.franchiseId !== user.franchiseId
      ) {
        return false
      }
      if (
        selectedRegion !== 'Global' &&
        e.region &&
        e.region !== selectedRegion
      ) {
        return false
      }

      return audienceMatch
    })
  }, [seasonalEvents, user, companies, selectedRegion])

  const activeEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return filteredEvents.filter((e) => {
      if (!e.startDate || !e.endDate) return false
      const start = new Date(e.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(e.endDate)
      end.setHours(23, 59, 59, 999)
      return start <= today && end >= today
    })
  }, [filteredEvents])

  const futureEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return filteredEvents.filter((e) => {
      if (!e.startDate) return false
      const start = new Date(e.startDate)
      start.setHours(0, 0, 0, 0)
      return start > today
    })
  }, [filteredEvents])

  const groupedActiveEvents = useMemo(
    () => groupEventsByMonth(activeEvents),
    [activeEvents],
  )
  const groupedFutureEvents = useMemo(
    () => groupEventsByMonth(futureEvents),
    [futureEvents],
  )

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0 animate-in fade-in zoom-in-95 duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <CalendarIcon className="h-8 w-8 text-primary" />
        {t('seasonal.title', 'Seasonal Calendar')}
      </h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3 mb-8">
          <TabsTrigger value="active" className="text-base">
            {t('seasonal.active_tab', 'Active')}
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary"
            >
              {activeEvents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="future" className="text-base">
            {t('seasonal.future_tab', 'Upcoming')}
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary"
            >
              {futureEvents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="organic" className="text-base">
            {t('seasonal.organic_tab', 'Organic')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 outline-none">
          {activeEvents.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedActiveEvents).map(([month, events]) => (
                <div key={month} className="space-y-4">
                  <h2 className="text-xl font-bold border-b pb-2 capitalize">
                    {month}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {events.map((e) => (
                      <SeasonalCampaignCard
                        key={e.id}
                        event={e}
                        isFuture={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t('seasonal.no_active', 'No active campaigns')}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {t(
                    'seasonal.no_active_desc',
                    'We do not have active campaigns for your profile or region at the moment.',
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="future" className="space-y-6 outline-none">
          {futureEvents.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedFutureEvents).map(([month, events]) => (
                <div key={month} className="space-y-4">
                  <h2 className="text-xl font-bold border-b pb-2 capitalize">
                    {month}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {events.map((e) => (
                      <SeasonalCampaignCard
                        key={e.id}
                        event={e}
                        isFuture={true}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t('seasonal.no_future', 'No upcoming campaigns')}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {t(
                    'seasonal.no_future_desc',
                    'Keep an eye out! New campaigns will be scheduled soon.',
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="organic" className="space-y-6 outline-none">
          <div className="flex items-center gap-2 mb-6">
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-md gap-2"
            >
              <Input
                placeholder={t(
                  'seasonal.search_organic',
                  'Buscar ofertas orgânicas...',
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {t('common.search', 'Buscar')}
              </Button>
            </form>
          </div>

          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card
                  key={i}
                  className="flex flex-col h-full animate-pulse border-none shadow-sm"
                >
                  <div className="h-48 bg-muted w-full rounded-t-xl" />
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                    <div className="h-8 bg-muted rounded w-1/3 mt-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : organicDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {organicDeals.map((deal, idx) => (
                <PromotionCard key={deal.id || idx} promotion={deal} />
              ))}
            </div>
          ) : hasSearched ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t(
                    'seasonal.no_organic_results',
                    'Nenhuma oferta encontrada',
                  )}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {t(
                    'seasonal.no_organic_results_desc',
                    'Tente buscar por outros termos para ver nossas recomendações inteligentes.',
                  )}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
