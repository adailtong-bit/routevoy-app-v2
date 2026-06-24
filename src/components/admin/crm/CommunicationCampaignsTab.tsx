import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CRMCampaignDialog } from './CRMCampaignDialog'
import { CRMCampaignTable } from './CRMCampaignTable'

export function CommunicationCampaignsTab() {
  const [open, setOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('crm_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      toast.error('Failed to load CRM Campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">CRM Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Manage communications across the network.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <CRMCampaignTable
        campaigns={campaigns}
        loading={loading}
        onRefresh={fetchCampaigns}
      />

      {open && (
        <CRMCampaignDialog
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => {
            setOpen(false)
            fetchCampaigns()
          }}
        />
      )}
    </div>
  )
}
