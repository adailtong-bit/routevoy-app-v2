import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Users } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function TargetGroupTable({
  targetGroups = [],
  loading,
  onEdit,
  onRefresh,
}: any) {
  const { t } = useLanguage()

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete', 'Deseja excluir este item?')))
      return
    try {
      const { error } = await supabase
        .from('crm_target_groups')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(t('common.deleted_success', 'Excluído com sucesso'))
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error('Erro ao excluir')
    }
  }

  if (loading)
    return <div className="p-8 text-center text-slate-500">Carregando...</div>

  return (
    <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('crm.group_name', 'Nome do Grupo')}</TableHead>
            <TableHead>{t('crm.leads_count', 'Leads')}</TableHead>
            <TableHead className="text-right">
              {t('common.actions', 'Ações')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targetGroups.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center py-8 text-muted-foreground"
              >
                {t('common.no_results', 'Nenhum grupo encontrado.')}
              </TableCell>
            </TableRow>
          ) : (
            targetGroups.map((tg: any) => (
              <TableRow key={tg.id}>
                <TableCell className="font-semibold text-slate-800">
                  {tg.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    {tg.lead_count || 0}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(tg)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tg.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
