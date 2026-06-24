import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'
import { TargetGroupDialog } from './TargetGroupDialog'

interface Props {
  groups: any[]
  isLoading: boolean
  onRefresh: () => void
}

export function TargetGroupTable({ groups, isLoading, onRefresh }: Props) {
  const [editingGroup, setEditingGroup] = useState<any>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this target group?')) return
    try {
      const { error } = await supabase
        .from('crm_target_groups')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast({ title: 'Group deleted successfully' })
      onRefresh()
    } catch (err: any) {
      toast({
        title: 'Error deleting group',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading target groups...
      </div>
    )
  if (!groups || groups.length === 0)
    return (
      <div className="p-8 text-center text-slate-500">
        No target groups found.
      </div>
    )

  return (
    <>
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(groups || []).map((g) => (
              <TableRow key={String(g.id)}>
                <TableCell className="font-medium">
                  {String(g.name || 'Unnamed')}
                </TableCell>
                <TableCell>{String(g.description || '-')}</TableCell>
                <TableCell>{Number(g.lead_count || 0)}</TableCell>
                <TableCell>
                  {new Date(String(g.created_at)).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingGroup(g)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(String(g.id))}
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

      {editingGroup && (
        <TargetGroupDialog
          open={!!editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(null)}
          onSuccess={() => {
            setEditingGroup(null)
            onRefresh()
          }}
          group={editingGroup}
          companyId={editingGroup.company_id}
          franchiseId={editingGroup.franchise_id}
          affiliateId={editingGroup.affiliate_id}
        />
      )}
    </>
  )
}
