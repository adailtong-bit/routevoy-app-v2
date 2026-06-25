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
      const { error, count } = await supabase
        .from('crm_campaigns')
        .delete({ count: 'exact' })
        .eq('id', id)

      if (error) {
        throw new Error(error.message || 'Error executing delete operation')
      }

      if (count === 0) {
        throw new Error(
          'Campaign could not be deleted. It may be blocked by linked records or you lack permissions.',
        )
      }

      toast.success('CRM Campaign deleted successfully')
      onRefresh()
    } catch (err: any) {
      console.error('Error deleting CRM campaign:', err)
      toast.error(err.message || 'Failed to delete CRM Campaign')
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
