import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, PlusCircle, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { format } from 'date-fns'

export function CampaignsManager({
  franchiseId,
  companyId,
  affiliateId,
  onEdit,
}: {
  franchiseId?: string
  companyId?: string
  affiliateId?: string
  onEdit?: (data: any) => void
}) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [companyId, franchiseId, affiliateId])

  const isValidUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('ad_campaigns')
        .select('*')
        .eq('environment', 'production')
        .order('created_at', { ascending: false })

      if (companyId) {
        if (isValidUUID(companyId)) {
          query = query.eq('company_id', companyId)
        } else {
          setCampaigns([])
          setLoading(false)
          return
        }
      }
      if (franchiseId) {
        query = query.eq('franchise_id', franchiseId)
      }
      if (affiliateId) {
        if (isValidUUID(affiliateId)) {
          query = query.eq('affiliate_id', affiliateId)
        } else {
          setCampaigns([])
          setLoading(false)
          return
        }
      }

      const { data, error } = await query

      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Campaign deleted successfully')
      fetchCampaigns()
    } catch (err) {
      console.error('Error deleting campaign:', err)
      toast.error('Failed to delete campaign')
    }
  }

  const handleEdit = (campaign: any) => {
    if (onEdit) {
      onEdit(campaign)
    } else {
      setEditingCampaign(campaign)
      setIsSheetOpen(true)
    }
  }

  const handleCreate = () => {
    if (onEdit) {
      onEdit(null)
    } else {
      setEditingCampaign(null)
      setIsSheetOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground">
            Manage your campaigns and monitor performance.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-muted-foreground border rounded-xl bg-slate-50/50">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          Loading campaigns...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="border rounded-xl p-5 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[240px]"
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3
                    className="font-semibold truncate text-lg"
                    title={campaign.title}
                  >
                    {campaign.title}
                  </h3>
                  <Badge
                    variant={
                      campaign.status === 'active' ? 'default' : 'secondary'
                    }
                    className="capitalize shrink-0"
                  >
                    {campaign.status || 'Active'}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {campaign.description || 'No description provided.'}
                </p>

                <div className="space-y-2 mb-4">
                  {(campaign.start_date || campaign.end_date) && (
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {campaign.start_date
                        ? format(new Date(campaign.start_date), 'MMM d, yyyy')
                        : '...'}{' '}
                      -
                      {campaign.end_date
                        ? format(new Date(campaign.end_date), 'MMM d, yyyy')
                        : '...'}
                    </div>
                  )}
                  {campaign.category && (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {campaign.category}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                    {campaign.views || 0} views
                  </span>
                  {campaign.budget !== null &&
                    campaign.budget !== undefined && (
                      <span className="text-xs font-bold text-emerald-600">
                        Budget: ${Number(campaign.budget).toLocaleString()}
                      </span>
                    )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(campaign)}
                    className="h-8 px-2.5"
                  >
                    <Edit className="w-4 h-4 mr-1.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(campaign.id)}
                    className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-slate-50/50">
              <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <PlusCircle className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No campaigns found
              </h3>
              <p className="text-slate-500 mb-4 max-w-sm mx-auto">
                Create your first advertising campaign to start reaching more
                customers.
              </p>
              <Button onClick={handleCreate}>Create Campaign</Button>
            </div>
          )}
        </div>
      )}

      {!onEdit && (
        <CampaignFormDialog
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          franchiseId={franchiseId}
          companyId={companyId}
          affiliateId={affiliateId}
          onSuccess={fetchCampaigns}
          editData={editingCampaign}
        />
      )}
    </div>
  )
}
