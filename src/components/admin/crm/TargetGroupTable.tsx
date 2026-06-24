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
import { Edit2, Trash2 } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function TargetGroupTable({ groups, loading, onRefresh, onEdit }: any) {
  const { t } = useLanguage()

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete', 'Tem certeza?'))) return
    const { error } = await supabase
      .from('crm_target_groups')
      .delete()
      .eq('id', id)
    if (error) {
      toast.error(t('common.error', 'Ocorreu um erro.'))
    } else {
      toast.success(t('common.success', 'Excluído com sucesso.'))
      onRefresh()
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-slate-500">
        {t('common.loading', 'Carregando...')}
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('crm.group_name', 'Nome do Grupo')}</TableHead>
            <TableHead>{t('crm.filters', 'Filtros')}</TableHead>
            <TableHead>{t('crm.leads_count', 'Leads')}</TableHead>
            <TableHead className="text-right">
              {t('common.actions', 'Ações')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups?.map((group: any) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">
                {group.name}
                {group.description && (
                  <p className="text-xs text-slate-500 mt-1">
                    {group.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {group.filters ? (
                    typeof group.filters === 'string' ? (
                      <Badge variant="secondary" className="text-xs">
                        {group.filters}
                      </Badge>
                    ) : (
                      Object.keys(group.filters).map((key) => {
                        const val = group.filters[key]
                        if (val === null || val === undefined) return null
                        if (Array.isArray(val) && val.length === 0) return null
                        return (
                          <Badge
                            key={key}
                            variant="outline"
                            className="text-xs bg-slate-50"
                          >
                            {key}:{' '}
                            {Array.isArray(val)
                              ? val.join(', ')
                              : typeof val === 'object'
                                ? JSON.stringify(val)
                                : String(val)}
                          </Badge>
                        )
                      })
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Sem filtros</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{group.leadCount || 0}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(group)}
                >
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(group.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!groups || groups.length === 0) && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-slate-500"
              >
                {t('crm.no_groups', 'Nenhum grupo encontrado.')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
