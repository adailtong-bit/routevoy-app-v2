import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
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
    <div className="border rounded-md overflow-x-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('crm.group_name', 'Nome')}</TableHead>
            <TableHead>{t('crm.group_desc', 'Descrição')}</TableHead>
            <TableHead>{t('crm.filters', 'Filtros')}</TableHead>
            <TableHead>{t('crm.lead_count', 'Leads')}</TableHead>
            <TableHead className="text-right">
              {t('common.actions', 'Ações')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targetGroups.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                {t('common.no_results', 'Nenhum registro encontrado.')}
              </TableCell>
            </TableRow>
          ) : (
            targetGroups.map((g: any) => (
              <TableRow key={g.id}>
                <TableCell className="font-semibold text-slate-800">
                  {g.name || '-'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {g.description || '-'}
                </TableCell>
                <TableCell className="text-slate-500 max-w-[200px] truncate">
                  {/* CRITICAL FIX: Ensure filters object is safely rendered as string to avoid React children errors */}
                  {typeof g.filters === 'object' && g.filters !== null
                    ? JSON.stringify(g.filters)
                    : String(g.filters || 'Nenhum')}
                </TableCell>
                <TableCell>{g.leadCount || 0}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(g)}>
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(g.id)}
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
