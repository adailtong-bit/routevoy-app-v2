import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Users, Ticket, DollarSign, Megaphone } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function VendorStats({ company, activeCampaigns }: any) {
  const { validationLogs } = useCouponStore()
  const { t } = useLanguage()

  // Always force BRL currency format as per AC requirements
  const customFormat = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)
  }

  const [stats, setStats] = useState({ redemptions: 0, leads: 0, revenue: 0 })

  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      if (!company?.id) return
      try {
        // Get coupons for this company
        const { data: myCoupons } = await supabase
          .from('coupons')
          .select('id, price')
          .eq('company_id', company.id)
        const couponIds = (myCoupons || []).map((c) => c.id)

        if (couponIds.length > 0) {
          const { data: engagements } = await supabase
            .from('user_engagements')
            .select('id, user_id, campaign_id')
            .in('campaign_id', couponIds)

          if (mounted && engagements) {
            const leadsCount = new Set(
              engagements.map((e) => e.user_id).filter(Boolean),
            ).size
            let rev = 0
            engagements.forEach((e) => {
              const cpn = myCoupons?.find((c) => c.id === e.campaign_id)
              rev += cpn?.price || 45.5
            })

            setStats({
              redemptions: engagements.length,
              leads: leadsCount,
              revenue: rev,
            })
          }
        } else {
          if (mounted) setStats({ redemptions: 0, leads: 0, revenue: 0 })
        }
      } catch (err) {
        console.error('Error fetching vendor stats:', err)
      }
    }
    fetchStats()
    return () => {
      mounted = false
    }
  }, [company])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in-up">
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {t('vendor.stats.total_redemptions', 'Total de Resgates')}
          </CardTitle>
          <div className="bg-primary/10 p-2 rounded-lg">
            <Ticket className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">
            {stats.redemptions}
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
            +12% do último mês
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {t('vendor.stats.active_leads', 'Leads Ativos (CRM)')}
          </CardTitle>
          <div className="bg-blue-50 p-2 rounded-lg">
            <Users className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">{stats.leads}</div>
          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
            +5 novos esta semana
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {t('vendor.stats.est_revenue', 'Receita Estimada')}
          </CardTitle>
          <div className="bg-emerald-50 p-2 rounded-lg">
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">
            {customFormat(stats.revenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('vendor.stats.based_on_ticket', 'Baseado no ticket médio')}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {t('vendor.stats.active_campaigns', 'Campanhas Ativas')}
          </CardTitle>
          <div className="bg-orange-50 p-2 rounded-lg">
            <Megaphone className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">
            {activeCampaigns}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('vendor.stats.active_scheduled', 'Ativas / Agendadas')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
