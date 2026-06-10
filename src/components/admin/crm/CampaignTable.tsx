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
  campaigns,
  targetGroups,
  loading,
  onEdit,
  onRefresh,
}: any) {
  const { t } = useLanguage()

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta campanha?')) return
    const { error } = await supabase.from('crm_campaigns').delete().eq('id', id)
    if (!error) {
      toast.success('Campanha excluída')
      onRefresh()
    }
  }

  const handleDispatch = async (camp: any) => {
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
    onRefresh()
  }

  if (loading) return <div className="p-4 text-center">Carregando...</div>

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.crm_tabs.campaign', 'Campaign')}</TableHead>
            <TableHead>
              {t('admin.crm_tabs.target_group', 'Target Group')}
            </TableHead>
            <TableHead>{t('admin.crm_tabs.channel', 'Channel')}</TableHead>
            <TableHead>{t('admin.crm_tabs.status', 'Status')}</TableHead>
            <TableHead className="text-right">
              {t('common.actions', 'Actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((camp: any) => {
            const tg = targetGroups.find(
              (g: any) => g.id === camp.targetGroupId,
            )
            return (
              <TableRow key={camp.id}>
                <TableCell className="font-semibold">{camp.name}</TableCell>
                <TableCell>{tg?.name || 'Global'}</TableCell>
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
                    {camp.status}
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
          })}
          {campaigns.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                Nenhuma campanha criada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
