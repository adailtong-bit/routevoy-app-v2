import { useState } from 'react'
import { useCrmData } from '@/hooks/use-crm-data'
import { TargetGroupTable } from './TargetGroupTable'
import { TargetGroupDialog } from './TargetGroupDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function TargetGroupsTab({ affiliateId, companyId, franchiseId }: any) {
  const { t } = useLanguage()
  const { targetGroups, loading, refresh } = useCrmData(
    franchiseId,
    companyId,
    affiliateId,
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900">
            {t('crm.target_groups.title', 'Grupos Alvo')}
          </h3>
          <p className="text-sm text-slate-500">
            {t('crm.target_groups.desc', 'Gerencie seus segmentos de público.')}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingGroup(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('crm.target_groups.add', 'Novo Grupo')}
        </Button>
      </div>

      <TargetGroupTable
        groups={targetGroups || []}
        loading={loading}
        onRefresh={refresh}
        onEdit={(group: any) => {
          setEditingGroup(group)
          setDialogOpen(true)
        }}
      />

      <TargetGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
        onSuccess={refresh}
        affiliateId={affiliateId}
        companyId={companyId}
        franchiseId={franchiseId}
      />
    </div>
  )
}
