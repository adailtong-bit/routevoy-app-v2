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
import { Edit2, Trash2, Send, Mail, MessageCircle } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function CampaignTable({
  campaigns = [],
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
        .from('crm_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(t('common.deleted_success', 'Excluído com sucesso'))
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error('Erro ao excluir')
    }
  }

  const handleDispatch = async (camp: any) => {
    try {
      await supabase
        .from('crm_campaigns')
        .update({ status: 'sent' })
        .eq('id', camp.id)
      const tg = targetGroups.find((g: any) => g.id === camp.targetGroupId)

      await supabase.functions.invoke('send-email', {
        body: {
          type: 'campaign',
          campaign_name: camp.name,
          content: camp.content,
          segmentation_filters: tg?.filters || {},
        },
      })
      toast.success('Campanha disparada com sucesso!')
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error('Erro ao disparar campanha')
    }
  }

  if (loading)
    return <div className="p-8 text-center text-slate-500">Carregando...</div>

  return (
    <div className="border rounded-md overflow-x-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('crm.campaign_name', 'Campanha')}</TableHead>
            <TableHead>{t('crm.target_group', 'Grupo Alvo')}</TableHead>
            <TableHead>{t('crm.channel', 'Canal')}</TableHead>
            <TableHead>{t('common.status', 'Status')}</TableHead>
            <TableHead className="text-right">
              {t('common.actions', 'Ações')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                {t('common.no_results', 'Nenhum registro encontrado.')}
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((camp: any) => {
              const tg = targetGroups.find(
                (g: any) => g.id === camp.targetGroupId,
              )
              return (
                <TableRow key={camp.id}>
                  <TableCell className="font-semibold text-slate-800">
                    {camp.name || '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {tg?.name || 'Global'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize flex items-center gap-1.5 w-fit"
                    >
                      {camp.channel === 'email' ? (
                        <Mail className="w-3 h-3" />
                      ) : (
                        <MessageCircle className="w-3 h-3" />
                      )}
                      {camp.channel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={camp.status === 'sent' ? 'default' : 'secondary'}
                    >
                      {camp.status || 'draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(camp)}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(camp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="ml-2"
                      disabled={camp.status === 'sent'}
                      onClick={() => handleDispatch(camp)}
                    >
                      <Send className="h-3 w-3 mr-2" /> Disparar
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
