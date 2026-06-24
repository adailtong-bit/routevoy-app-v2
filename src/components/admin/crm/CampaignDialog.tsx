import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'

export function CampaignDialog({
  open,
  onOpenChange,
  campaign,
  targetGroups,
  onSuccess,
  affiliateId,
  companyId,
  franchiseId,
}: any) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [targetGroupId, setTargetGroupId] = useState('global')
  const [channel, setChannel] = useState('email')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (campaign) {
        setName(campaign.name || '')
        setTargetGroupId(campaign.targetGroupId || 'global')
        setChannel(campaign.channel || 'email')
        setContent(campaign.content || '')
      } else {
        setName('')
        setTargetGroupId('global')
        setChannel('email')
        setContent('')
      }
    }
  }, [open, campaign])

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      toast.error(
        t('common.required_fields', 'Preencha os campos obrigatórios'),
      )
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        target_group_id: targetGroupId === 'global' ? null : targetGroupId,
        channel,
        content: content.trim(),
        affiliate_id: affiliateId || null,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        status: campaign?.status || 'draft',
      }

      if (campaign?.id) {
        const { error } = await supabase
          .from('crm_campaigns')
          .update(payload)
          .eq('id', campaign.id)
        if (error) throw error
        toast.success(t('common.updated_success', 'Atualizado com sucesso'))
      } else {
        const { error } = await supabase.from('crm_campaigns').insert([payload])
        if (error) throw error
        toast.success(t('common.created_success', 'Criado com sucesso'))
      }
      if (onSuccess) onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {campaign
              ? t('crm.edit_campaign', 'Editar Campanha')
              : t('crm.new_campaign', 'Nova Campanha')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('common.name', 'Nome')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da Campanha"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('crm.target_group', 'Grupo Alvo')}</Label>
              <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Todos (Global)</SelectItem>
                  {targetGroups?.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('crm.channel', 'Canal')}</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('common.content', 'Conteúdo / Mensagem')}</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading
              ? t('common.saving', 'Salvando...')
              : t('common.save', 'Salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
