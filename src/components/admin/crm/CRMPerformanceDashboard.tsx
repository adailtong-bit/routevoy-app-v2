import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Megaphone, MousePointerClick, Zap } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'

export function CRMPerformanceDashboard({
  companyId,
  franchiseId,
  affiliateId,
}: {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}) {
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCampaigns: 0,
    totalClicks: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        let campQuery = supabase
          .from('crm_campaigns')
          .select('id, clicks, redemptions')
        let tgQuery = supabase.from('crm_target_groups').select('lead_count')

        if (companyId) {
          campQuery = campQuery.eq('company_id', companyId)
          tgQuery = tgQuery.eq('company_id', companyId)
        } else if (franchiseId) {
          campQuery = campQuery.eq('franchise_id', franchiseId)
          tgQuery = tgQuery.eq('franchise_id', franchiseId)
        } else if (affiliateId) {
          campQuery = campQuery.eq('affiliate_id', affiliateId)
          tgQuery = tgQuery.eq('affiliate_id', affiliateId)
        }

        const [campRes, tgRes] = await Promise.all([campQuery, tgQuery])

        const campaigns = campRes.data || []
        const targets = tgRes.data || []

        const totalCampaigns = campaigns.length
        const totalClicks = campaigns.reduce(
          (acc, c) => acc + (c.clicks || 0),
          0,
        )
        const totalRedemptions = campaigns.reduce(
          (acc, c) => acc + (c.redemptions || 0),
          0,
        )
        const totalLeads = targets.reduce(
          (acc, g) => acc + (g.lead_count || 0),
          0,
        )
        const conversionRate =
          totalClicks > 0 ? (totalRedemptions / totalClicks) * 100 : 0

        setStats({
          totalLeads,
          totalCampaigns,
          totalClicks,
          conversionRate,
        })
      } catch (err) {
        console.error('Error fetching CRM stats:', err)
      }
    }
    fetchStats()
  }, [companyId, franchiseId, affiliateId])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('crm.stats.leads', 'Total de Leads')}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLeads}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('crm.stats.campaigns', 'Campanhas')}
          </CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('crm.stats.clicks', 'Cliques em Links')}
          </CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClicks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('crm.stats.conversion', 'Taxa de Conversão')}
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.conversionRate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
