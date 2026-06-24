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
import { Edit2, Trash2, Users } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function TargetGroupTable({
  groups = [],
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
    } catch (err: any) {
      toast.error('Erro ao excluir')
    }
  }

  if (loading)
    return <div className="p-8 text-center text-slate-500">Carregando...</div>

  return (
    <div className="border rounded-md bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('crm.group_name', 'Nome do Grupo')}</TableHead>
            <TableHead>{t('crm.filters', 'Filtros')}</TableHead>
            <TableHead>{t('crm.leads', 'Leads')}</TableHead>
            <TableHead className="text-right">
              {t('common.actions', 'Ações')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                {t('common.no_results', 'Nenhum registro encontrado.')}
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group: any) => (
              <TableRow key={group.id}>
                <TableCell>
                  <p className="font-semibold text-slate-800">
                    {group.name || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {group.description || '-'}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[250px]">
                    {group.filters ? (
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-[10px]"
                      >
                        Ativos
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">Nenhum</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Users className="h-4 w-4 text-primary" />{' '}
                    {group.leadCount || 0}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(group)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(group.id)}
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
