import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Calendar,
  Building,
  Clock,
  Tag,
  Share2,
  Facebook,
  Instagram,
  Lock,
  Star,
  Gift,
} from 'lucide-react'
import { format, isFuture } from 'date-fns'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'

function SeasonalAgendaContent() {
  const { t } = useLanguage()
  const { user, profile } = useAuth()

  const isVip =
    profile?.is_vip || profile?.is_affiliate || profile?.role === 'super_admin'

  const [agendaItems, setAgendaItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [shares, setShares] = useState<number>(0)
  const [sharing, setSharing] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAgenda() {
      const { data, error } = await supabase
        .from('discovered_promotions')
        .select('*')
        .eq('is_seasonal', true)
        .order('start_date', { ascending: true })

      if (!error && data) {
        setAgendaItems(data)
      }
      setLoading(false)
    }

    async function fetchShares() {
      if (user) {
        const { count } = await supabase
          .from('user_engagements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('action_type', 'social_share')

        setShares(count || 0)
      }
    }

    fetchAgenda()
    fetchShares()
  }, [user])

  const formatDateRange = (start?: string, end?: string) => {
    try {
      if (!start && !end) return 'TBA'
      if (start && !end) return `${format(new Date(start), 'MMM dd')}`
      if (!start && end) return `Until ${format(new Date(end), 'MMM dd')}`
      return `${format(new Date(start!), 'MMM dd')} - ${format(new Date(end!), 'MMM dd')}`
    } catch {
      return 'Invalid Date'
    }
  }

  const handleShare = async (platform: string, itemId: string) => {
    if (!user) {
      toast.error(t('auth.login_required', 'Please sign in to share.'))
      return
    }

    setSharing(itemId)
    toast.success(t('seasonal.sharing_to', `Sharing to ${platform}...`))

    const { error } = await supabase.from('user_engagements').insert({
      user_id: user.id,
      campaign_id: itemId,
      action_type: 'social_share',
    })

    setSharing(null)

    if (!error) {
      const newShares = shares + 1
      setShares(newShares)

      if (newShares === 3) {
        toast.success(
          t(
            'seasonal.reward_unlocked',
            'Reward Unlocked! Check your vouchers.',
          ),
          {
            icon: <Gift className="w-5 h-5 text-green-500" />,
            duration: 5000,
          },
        )
      } else {
        toast.success(
          t(
            'seasonal.share_success',
            'Share tracked! Complete 3 shares to unlock a reward.',
          ),
        )
      }
    }
  }

  const isEarlyAccess = (startDate?: string) => {
    if (!startDate) return false
    return isFuture(new Date(startDate))
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-fade-in-up">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          {t('nav.seasonal_agenda', 'Seasonal Agenda')}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          {t(
            'seasonal.agenda_desc',
            'Discover upcoming seasonal events and exclusive campaigns planned for the year. Complete social missions to earn VIP rewards!',
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : agendaItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">
            No events scheduled
          </h3>
          <p className="text-slate-500 mt-2">
            Check back later for new seasonal events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agendaItems.map((item) => {
            const early = isEarlyAccess(item.start_date)
            const locked = early && !isVip

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="relative h-48 bg-slate-100 shrink-0 overflow-hidden">
                  {locked && (
                    <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                      <Lock className="w-8 h-8 mb-2" />
                      <span className="font-bold text-sm">
                        {t('seasonal.locked_until', 'Locked until')}{' '}
                        {format(new Date(item.start_date!), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.store_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Calendar className="w-10 h-10 text-slate-400" />
                    </div>
                  )}

                  {early && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm border-none flex items-center gap-1.5 px-2.5 py-1">
                        <Star className="w-3 h-3 fill-white" />
                        {t('seasonal.vip_early_access', 'VIP Early Access')}
                      </Badge>
                    </div>
                  )}

                  {!early && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-slate-800 flex items-center gap-1.5 shadow-sm z-10">
                      <Clock className="w-4 h-4 text-primary" />
                      {formatDateRange(item.start_date, item.end_date)}
                    </div>
                  )}

                  {item.is_agenda_only && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm border-none">
                        <Tag className="w-3 h-3 mr-1" />
                        Agenda Only
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
                    <Building className="w-4 h-4" />
                    {item.store_name || 'Partner Company'}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm flex-1 line-clamp-3">
                    {item.description ||
                      'Join us for this special seasonal event!'}
                  </p>

                  <div className="mt-5 pt-4 border-t flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Share2 className="w-4 h-4" />{' '}
                        {t('seasonal.share_earn', 'Share & Earn')}
                      </span>
                      {shares >= 3 ? (
                        <Badge className="bg-green-500 hover:bg-green-600 border-none text-white font-bold px-2 py-0.5 shadow-sm">
                          <Gift className="w-3 h-3 mr-1" />{' '}
                          {t('seasonal.reward_unlocked_short', 'Unlocked')}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 font-medium text-xs bg-slate-100 px-2 py-1 rounded-md">
                          {shares}/3 Shares
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                        onClick={() => handleShare('WhatsApp', item.id)}
                        disabled={locked || sharing === item.id}
                      >
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        onClick={() => handleShare('Facebook', item.id)}
                        disabled={locked || sharing === item.id}
                      >
                        Facebook
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                        onClick={() => handleShare('Instagram', item.id)}
                        disabled={locked || sharing === item.id}
                      >
                        Instagram
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SeasonalAgenda() {
  return (
    <ErrorBoundary>
      <SeasonalAgendaContent />
    </ErrorBoundary>
  )
}
