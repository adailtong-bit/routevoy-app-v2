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
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function CRMCampaignTable({
  campaigns,
  loading,
  onRefresh,
}: {
  campaigns: any[]
  loading: boolean
  onRefresh: () => void
}) {
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this CRM Campaign?')) return
    try {
      const { error } = await supabase
        .from('crm_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('CRM Campaign deleted')
      onRefresh()
    } catch (err) {
      toast.error('Failed to delete CRM Campaign')
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md">
        Loading CRM Campaigns...
      </div>
    )
  if (campaigns.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md">
        No CRM Campaigns found.
      </div>
    )

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CRM Campaign Name</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="capitalize">{c.channel}</TableCell>
              <TableCell>
                <Badge>{c.status}</Badge>
              </TableCell>
              <TableCell>
                {new Date(c.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
