import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CampaignTable } from './CampaignTable'
import { CampaignDialog } from './CampaignDialog'
import { Plus } from 'lucide-react'

interface Props {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}

export function CommunicationCampaignsTab({
  companyId,
  franchiseId,
  affiliateId,
}: Props) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchCampaigns = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('crm_campaigns')
        .select('*, target_group:crm_target_groups(name)')
        .order('created_at', { ascending: false })

      if (companyId) query = query.eq('company_id', companyId)
      else if (franchiseId) query = query.eq('franchise_id', franchiseId)
      else if (affiliateId) query = query.eq('affiliate_id', affiliateId)

      const { data, error } = await query
      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [companyId, franchiseId, affiliateId])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Campaign
        </Button>
      </div>

      <CampaignTable
        campaigns={campaigns}
        isLoading={isLoading}
        onRefresh={fetchCampaigns}
      />

      <CampaignDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchCampaigns}
        companyId={companyId}
        franchiseId={franchiseId}
        affiliateId={affiliateId}
      />
    </div>
  )
}
