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

export function TargetGroupTable({ groups, loading, onEdit, onRefresh }: any) {
  const { t } = useLanguage()

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este grupo?')) return
    const { error } = await supabase
      .from('crm_target_groups')
      .delete()
      .eq('id', id)
    if (!error) {
      toast.success('Grupo excluído com sucesso')
      onRefresh()
    }
  }

  if (loading) return <div className="p-4 text-center">Carregando...</div>

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {t('admin.crm_tabs.group_name', 'Group Name')}
            </TableHead>
            <TableHead>
              {t('admin.crm_tabs.applied_filters', 'Applied Filters')}
            </TableHead>
            <TableHead>{t('admin.crm_tabs.leads', 'Leads')}</TableHead>
            <TableHead className="text-right">
              {t('common.actions', 'Actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group: any) => (
            <TableRow key={group.id}>
              <TableCell>
                <p className="font-semibold text-slate-800">{group.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {group.description}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[250px]">
                  {group.filters?.categories?.length > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-[10px] truncate max-w-[120px]"
                      title={group.filters.categories.join(', ')}
                    >
                      Cat:{' '}
                      {group.filters.categories.length > 1
                        ? `${group.filters.categories.length} selecs.`
                        : group.filters.categories[0]}
                    </Badge>
                  )}
                  {group.filters?.gender && group.filters.gender !== 'all' && (
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-[10px]"
                    >
                      {group.filters.gender}
                    </Badge>
                  )}
                  {group.filters?.state && group.filters.state !== 'all' && (
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-[10px]"
                    >
                      Est: {group.filters.state}
                    </Badge>
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
          ))}
          {groups.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                {t('common.none', 'No target group created.')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
