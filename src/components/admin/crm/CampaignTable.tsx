import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'
import { CampaignDialog } from './CampaignDialog'

interface Props {
  campaigns: any[]
  isLoading: boolean
  onRefresh: () => void
}

export function CampaignTable({ campaigns, isLoading, onRefresh }: Props) {
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CRM campaign?')) return
    try {
      const { error } = await supabase
        .from('crm_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast({ title: 'CRM Campaign deleted successfully' })
      onRefresh()
    } catch (err: any) {
      toast({
        title: 'Error deleting CRM campaign',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading CRM campaigns...
      </div>
    )
  if (!campaigns || campaigns.length === 0)
    return (
      <div className="p-8 text-center text-slate-500">
        No CRM campaigns found.
      </div>
    )

  return (
    <>
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target Group</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(campaigns || []).map((c) => (
              <TableRow key={String(c.id)}>
                <TableCell className="font-medium">
                  {String(c.name || 'Unnamed')}
                </TableCell>
                <TableCell className="capitalize">
                  {String(c.channel || 'Unknown')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={c.status === 'active' ? 'default' : 'secondary'}
                  >
                    {String(c.status || 'draft')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {c.target_group
                    ? String(c.target_group.name || 'Unknown')
                    : 'All'}
                </TableCell>
                <TableCell>{Number(c.clicks || 0)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCampaign(c)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(String(c.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingCampaign && (
        <CampaignDialog
          open={!!editingCampaign}
          onOpenChange={(open) => !open && setEditingCampaign(null)}
          onSuccess={() => {
            setEditingCampaign(null)
            onRefresh()
          }}
          campaign={editingCampaign}
          companyId={editingCampaign.company_id}
          franchiseId={editingCampaign.franchise_id}
          affiliateId={editingCampaign.affiliate_id}
        />
      )}
    </>
  )
}
