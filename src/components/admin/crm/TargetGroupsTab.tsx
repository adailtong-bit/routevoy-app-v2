import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { TargetGroupTable } from './TargetGroupTable'
import { TargetGroupDialog } from './TargetGroupDialog'
import { Plus } from 'lucide-react'

interface Props {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}

export function TargetGroupsTab({
  companyId,
  franchiseId,
  affiliateId,
}: Props) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchGroups = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('crm_target_groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (companyId) query = query.eq('company_id', companyId)
      else if (franchiseId) query = query.eq('franchise_id', franchiseId)
      else if (affiliateId) query = query.eq('affiliate_id', affiliateId)

      const { data, error } = await query
      if (error) throw error
      setGroups(data || [])
    } catch (err) {
      console.error('Error fetching target groups:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [companyId, franchiseId, affiliateId])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Target Groups</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Group
        </Button>
      </div>

      <TargetGroupTable
        groups={groups}
        isLoading={isLoading}
        onRefresh={fetchGroups}
      />

      <TargetGroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchGroups}
        companyId={companyId}
        franchiseId={franchiseId}
        affiliateId={affiliateId}
      />
    </div>
  )
}
