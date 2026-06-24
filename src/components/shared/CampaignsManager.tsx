import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export function CampaignsManager({ onEdit }: { onEdit?: (data: any) => void }) {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false })

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

  if (loading)
    return (
      <div className="text-center p-8 text-muted-foreground border rounded-md">
        Loading campaigns...
      </div>
    )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold truncate">{campaign.title}</h3>
              <Badge
                variant={campaign.status === 'active' ? 'default' : 'secondary'}
              >
                {campaign.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {campaign.description}
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-medium">
              {campaign.views || 0} views
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(campaign)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(campaign.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      {campaigns.length === 0 && (
        <div className="col-span-full text-center py-10 text-muted-foreground border rounded-md">
          No advertisement campaigns found. Create your first one!
        </div>
      )}
    </div>
  )
}
