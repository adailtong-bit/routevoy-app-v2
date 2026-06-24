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
import {
  Edit2,
  Trash2,
  Send,
  Mail,
  MessageCircle,
  Smartphone,
  BellRing,
} from 'lucide-react'
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
    if (
      !confirm(
        t(
          'common.confirm_delete',
          'Are you sure you want to delete this item?',
        ),
      )
    )
      return
    try {
      const { error } = await supabase
        .from('crm_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(t('common.deleted_success', 'Deleted successfully'))
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(t('common.error', 'Error deleting item'))
    }
  }

  const handleDispatch = async (camp: any) => {
    try {
      const { error } = await supabase
        .from('crm_campaigns')
        .update({ status: 'sent' })
        .eq('id', camp.id)
      if (error) throw error

      const tg = targetGroups?.find((g: any) => g.id === camp.target_group_id)

      await supabase.functions.invoke('send-email', {
        body: {
          type: 'campaign',
          campaign_name: camp.name,
          content: camp.content,
          segmentation_filters: tg?.filters || {},
        },
      })
      toast.success(t('common.success', 'Campanha disparada com sucesso!'))
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(t('common.error', 'Erro ao disparar campanha'))
    }
  }

  if (loading)
    return <div className="p-8 text-center text-slate-500">Loading...</div>

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-3 h-3" />
      case 'whatsapp':
        return <MessageCircle className="w-3 h-3" />
      case 'sms':
        return <Smartphone className="w-3 h-3" />
      case 'push':
        return <BellRing className="w-3 h-3" />
      default:
        return <Mail className="w-3 h-3" />
    }
  }

  return (
    <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('crm.campaign_name', 'Campaign')}</TableHead>
            <TableHead>{t('crm.target_group', 'Target Group')}</TableHead>
            <TableHead>{t('crm.channel', 'Channel')}</TableHead>
            <TableHead>{t('common.status', 'Status')}</TableHead>
            <TableHead className="text-right">
              {t('common.actions', 'Actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!campaigns || campaigns.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                {t('common.no_results', 'No campaigns found.')}
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((camp: any) => {
              const tg = targetGroups?.find(
                (g: any) => g.id === camp.target_group_id,
              )
              const safeName =
                typeof camp.name === 'object'
                  ? JSON.stringify(camp.name)
                  : camp.name
              const safeTgName =
                tg && typeof tg.name === 'object'
                  ? JSON.stringify(tg.name)
                  : tg?.name
              const safeChannel =
                typeof camp.channel === 'object'
                  ? JSON.stringify(camp.channel)
                  : camp.channel
              const safeStatus =
                typeof camp.status === 'object'
                  ? JSON.stringify(camp.status)
                  : camp.status

              return (
                <TableRow key={camp.id}>
                  <TableCell className="font-semibold text-slate-800">
                    {safeName || '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {safeTgName || 'Global'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize flex items-center gap-1.5 w-fit"
                    >
                      {getChannelIcon(camp.channel)}
                      {safeChannel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={camp.status === 'sent' ? 'default' : 'secondary'}
                    >
                      {safeStatus || 'draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(camp)}
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
                      <Send className="h-3 w-3 mr-2" />{' '}
                      {t('common.dispatch', 'Dispatch')}
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
