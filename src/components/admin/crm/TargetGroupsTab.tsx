import { useState } from 'react'
import { useCrmData } from '@/hooks/use-crm-data'
import { TargetGroupTable } from './TargetGroupTable'
import { TargetGroupDialog } from './TargetGroupDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function TargetGroupsTab({ companyId, franchiseId, affiliateId }: any) {
  const { t } = useLanguage()
  const { targetGroups, loading, refresh } = useCrmData(
    franchiseId,
    companyId,
    affiliateId,
  )
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-800">
            {t('crm.target_groups.title', 'Grupos Alvo')}
          </h3>
          <p className="text-sm text-slate-500">
            {t(
              'crm.target_groups.desc',
              'Crie segmentos de audiência para suas campanhas.',
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('crm.target_groups.create', 'Criar Grupo')}
        </Button>
      </div>

      <TargetGroupTable
        targetGroups={targetGroups}
        loading={loading}
        onEdit={(g: any) => {
          setEditData(g)
          setOpen(true)
        }}
        onRefresh={refresh}
      />

      {open && (
        <TargetGroupDialog
          open={open}
          onOpenChange={setOpen}
          companyId={companyId}
          franchiseId={franchiseId}
          affiliateId={affiliateId}
          editData={editData}
          onSuccess={refresh}
        />
      )}
    </div>
  )
}
