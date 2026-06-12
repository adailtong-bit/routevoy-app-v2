import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Ticket, DollarSign, Activity } from 'lucide-react'

export function FranchiseeOverviewTab({ franchise }: { franchise: any }) {
  const [metrics, setMetrics] = useState({
    merchants: 0,
    coupons: 0,
    revenue: 0,
    activities: [] as any[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!franchise?.id) return

      const { count: merchantsCount } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true })
        .eq('franchise_id', franchise.id)
      const { count: couponsCount } = await supabase
        .from('coupons')
        .select('*', { count: 'exact', head: true })
        .eq('franchise_id', franchise.id)
        .eq('status', 'active')

      // Fetch revenue strictly from the financial ledger as per AC
      const { data: ledgers } = await supabase
        .from('financial_ledger')
        .select('amount')
        .eq('franchise_id', franchise.id)
        .eq('type', 'credit')
      const totalRevenue =
        ledgers?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0

      // Workaround: Get profiles in this franchise first, then query logs for them
      const { data: team } = await supabase
        .from('profiles')
        .select('email')
        .eq('franchise_id', franchise.id)
      const emails = team?.map((t) => t.email) || []

      let logs = []
      if (emails.length > 0) {
        const { data: logsData } = await supabase
          .from('audit_logs')
          .select('*')
          .in('user_email', emails)
          .order('created_at', { ascending: false })
          .limit(5)
        logs = logsData || []
      }

      setMetrics({
        merchants: merchantsCount || 0,
        coupons: couponsCount || 0,
        revenue: totalRevenue || 0,
        activities: logs || [],
      })
      setLoading(false)
    }
    loadData()
  }, [franchise])

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse text-slate-500 font-medium">
        Loading overview metrics...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Regional Overview</h2>
        <p className="text-slate-500">
          Performance metrics for {franchise.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center justify-between">
              Total Merchants
              <Store className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">
              {metrics.merchants}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Affiliated stores in your region
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center justify-between">
              Active Campaigns
              <Ticket className="w-4 h-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">
              {metrics.coupons}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Promotions running right now
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center justify-between">
              Total Revenue
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">
              ${metrics.revenue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Generated from ad placements
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.activities.length === 0 ? (
            <p className="text-slate-500 py-4 text-center">
              No recent activities found.
            </p>
          ) : (
            <div className="space-y-4">
              {metrics.activities.map((act) => (
                <div
                  key={act.id}
                  className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-800">{act.action}</p>
                    <p className="text-sm text-slate-500">
                      {act.details || `Performed on ${act.entity_type}`}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">
                    {new Date(act.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
