import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CRMCampaignDialog } from '@/components/merchant/CRMCampaignDialog'
import { Badge } from '@/components/ui/badge'

export function CRMCampaignsTab() {
  const [open, setOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load CRM Campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CRM Campaign?')) return
    try {
      const { error } = await supabase
        .from('crm_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('CRM Campaign deleted successfully')
      fetchCampaigns()
    } catch (err) {
      toast.error('Failed to delete CRM Campaign')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">CRM Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Manage your automated communications.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 border rounded-lg bg-card">
          Loading CRM Campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-card text-muted-foreground">
          No CRM Campaigns found. Create your first one.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg p-4 bg-card flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <Badge>{c.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Channel: {c.channel}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
