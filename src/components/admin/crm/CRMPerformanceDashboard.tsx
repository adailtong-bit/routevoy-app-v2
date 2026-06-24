import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Megaphone, MousePointerClick, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Props {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}

export function CRMPerformanceDashboard({
  companyId,
  franchiseId,
  affiliateId,
}: Props) {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalCampaigns: 0,
    totalClicks: 0,
    totalRedemptions: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        let groupsQuery = supabase
          .from('crm_target_groups')
          .select('id', { count: 'exact' })
        let campaignsQuery = supabase
          .from('crm_campaigns')
          .select('clicks, redemptions', { count: 'exact' })

        if (companyId) {
          groupsQuery = groupsQuery.eq('company_id', companyId)
          campaignsQuery = campaignsQuery.eq('company_id', companyId)
        } else if (franchiseId) {
          groupsQuery = groupsQuery.eq('franchise_id', franchiseId)
          campaignsQuery = campaignsQuery.eq('franchise_id', franchiseId)
        } else if (affiliateId) {
          groupsQuery = groupsQuery.eq('affiliate_id', affiliateId)
          campaignsQuery = campaignsQuery.eq('affiliate_id', affiliateId)
        }

        const [groupsRes, campaignsRes] = await Promise.all([
          groupsQuery,
          campaignsQuery,
        ])

        const campaigns = campaignsRes.data || []
        const totalClicks = campaigns.reduce(
          (acc, curr) => acc + (Number(curr.clicks) || 0),
          0,
        )
        const totalRedemptions = campaigns.reduce(
          (acc, curr) => acc + (Number(curr.redemptions) || 0),
          0,
        )

        setStats({
          totalGroups: groupsRes.count || 0,
          totalCampaigns: campaignsRes.count || 0,
          totalClicks,
          totalRedemptions,
        })
      } catch (err) {
        console.error('Error fetching CRM stats:', err)
      }
    }

    fetchStats()
  }, [companyId, franchiseId, affiliateId])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Target Groups</CardTitle>
          <Users className="w-4 h-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalGroups}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Active Campaigns
          </CardTitle>
          <Megaphone className="w-4 h-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <MousePointerClick className="w-4 h-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClicks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
          <Ticket className="w-4 h-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
        </CardContent>
      </Card>
    </div>
  )
}
