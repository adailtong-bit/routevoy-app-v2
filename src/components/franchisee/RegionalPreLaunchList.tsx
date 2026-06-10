import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rocket } from 'lucide-react'

export function RegionalPreLaunchList({
  franchiseId,
  isSuperAdmin,
}: {
  franchiseId: string
  isSuperAdmin: boolean
}) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)

      let companyIds: string[] = []
      if (!isSuperAdmin) {
        const { data: merchants } = await supabase
          .from('merchants')
          .select('id')
          .eq('region_id', franchiseId)
        companyIds = (merchants || []).map((m) => m.id)
      }

      let query = supabase
        .from('discovered_promotions')
        .select('*')
        .eq('promotion_model', 'pre-launch')

      if (!isSuperAdmin && companyIds.length > 0) {
        query = query.in('company_id', companyIds)
      } else if (!isSuperAdmin && companyIds.length === 0) {
        setCampaigns([])
        setLoading(false)
        return
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      })
      if (!error && data) {
        setCampaigns(data)
      }
      setLoading(false)
    }

    fetchCampaigns()
  }, [franchiseId, isSuperAdmin])

  if (loading)
    return <p className="text-slate-500">Loading regional campaigns...</p>

  if (campaigns.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl bg-slate-50">
        <Rocket className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">
          No Pre-launch campaigns active in this region.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {campaigns.map((camp) => (
        <Card key={camp.id} className="overflow-hidden border border-slate-200">
          <div className="h-32 bg-slate-100">
            {camp.image_url ? (
              <img
                src={camp.image_url}
                alt={camp.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                <Rocket className="w-6 h-6" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4
                className="font-bold line-clamp-1 text-slate-800"
                title={camp.title}
              >
                {camp.title}
              </h4>
              {camp.is_seasonal && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 shrink-0"
                >
                  Seasonal
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
              {camp.description}
            </p>
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-2.5 rounded-lg flex flex-col gap-1">
              <span>
                <strong className="font-semibold">Goal:</strong>{' '}
                {camp.engagement_threshold} shares
              </span>
              <span>
                <strong className="font-semibold">Reward:</strong>{' '}
                {camp.reward_type} ({camp.reward_value})
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
