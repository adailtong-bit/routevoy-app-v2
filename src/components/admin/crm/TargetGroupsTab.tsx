import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TargetGroupTable } from './TargetGroupTable'
import { TargetGroupDialog } from './TargetGroupDialog'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function TargetGroupsTab({
  companyId,
  franchiseId,
  affiliateId,
}: {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}) {
  const [targetGroups, setTargetGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<any>(null)
  const { t } = useLanguage()

  const fetchData = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('crm_target_groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (companyId) query = query.eq('company_id', companyId)
      else if (franchiseId) query = query.eq('franchise_id', franchiseId)
      else if (affiliateId) query = query.eq('affiliate_id', affiliateId)

      const { data, error } = await query
      if (error) throw error
      setTargetGroups(data || [])
    } catch (err) {
      console.error(err)
      toast.error(t('common.error', 'Ocorreu um erro'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId, franchiseId, affiliateId])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingTarget(null)
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Criar Grupo Alvo
        </Button>
      </div>
      <TargetGroupTable
        targetGroups={targetGroups}
        loading={loading}
        onRefresh={fetchData}
        onEdit={(tg: any) => {
          setEditingTarget(tg)
          setIsDialogOpen(true)
        }}
      />
      <TargetGroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={companyId}
        franchiseId={franchiseId}
        affiliateId={affiliateId}
        initialData={editingTarget}
        onSuccess={fetchData}
      />
    </div>
  )
}
