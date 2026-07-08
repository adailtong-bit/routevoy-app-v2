import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit2, Plus, Trash2, Loader2, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { AdvertiserCampaignFormDialog } from './AdvertiserCampaignFormDialog'

export function AdvertiserCampaignsTab({
  franchiseId,
  environment = 'production',
}: {
  franchiseId?: string
  environment?: string
}) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [advertisers, setAdvertisers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)

    let query = supabase
      .from('ad_campaigns')
      .select('*')
      .not('advertiser_id', 'is', null)
      .order('created_at', { ascending: false })

    if (franchiseId) {
      query = query.eq('franchise_id', franchiseId)
    }

    const { data, error } = await query
    if (error) {
      toast.error('Error loading campaigns: ' + error.message)
    } else {
      setCampaigns(data || [])
    }

    let advQuery = supabase.from('ad_advertisers').select('id, company_name')
    const { data: advData } = await advQuery.order('company_name')
    if (advData) setAdvertisers(advData)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [franchiseId])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    const { error } = await supabase.from('ad_campaigns').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Campaign deleted')
      fetchData()
    }
  }

  const getAdvertiserName = (id: string) => {
    return advertisers.find((a) => a.id === id)?.company_name || 'Unknown'
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Advertiser Campaigns
            </h3>
            <p className="text-sm text-slate-500">
              Banner campaigns linked to advertisers
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditData(null)
            setIsDialogOpen(true)
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">
                Campaign
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Advertiser
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Placement
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  No advertiser campaigns found.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      {c.image && (
                        <img
                          src={c.image}
                          alt={c.title}
                          className="w-12 h-8 rounded object-cover"
                        />
                      )}
                      <span className="truncate max-w-[200px]">{c.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {getAdvertiserName(c.advertiser_id)}
                  </TableCell>
                  <TableCell className="text-slate-600 capitalize">
                    {c.placement?.replace(/_/g, ' ') || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditData(c)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isDialogOpen && (
        <AdvertiserCampaignFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          franchiseId={franchiseId}
          environment={environment}
          onSuccess={fetchData}
          editData={editData}
          advertisers={advertisers}
        />
      )}
    </div>
  )
}
