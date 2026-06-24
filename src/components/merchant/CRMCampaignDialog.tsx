import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

export function CRMCampaignDialog({
  open,
  onOpenChange,
  companyId,
  franchiseId,
  affiliateId,
  initialData,
  onSuccess,
}: any) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    channel: 'email',
    content: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        channel: initialData.channel || 'email',
        content: initialData.content || '',
      })
    } else {
      setFormData({ name: '', channel: 'email', content: '' })
    }
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        channel: formData.channel,
        content: formData.content,
        company_id: companyId,
        franchise_id: franchiseId,
        affiliate_id: affiliateId,
        status: initialData ? initialData.status : 'draft',
      }

      let error
      if (initialData?.id) {
        const res = await supabase
          .from('crm_campaigns')
          .update(payload)
          .eq('id', initialData.id)
        error = res.error
      } else {
        const res = await supabase.from('crm_campaigns').insert(payload)
        error = res.error
      }

      if (error) throw error
      toast.success(t('crm.created_success', 'Campanha salva com sucesso!'))
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error(t('common.error', 'Ocorreu um erro'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? 'Editar Campanha'
              : t('crm.create_campaign', 'Criar Nova Campanha')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'crm.create_campaign_desc',
              'Configure os detalhes da sua campanha.',
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('crm.campaign_name', 'Nome da Campanha')}</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('crm.channel', 'Canal')}</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.channel}
              onChange={(e) =>
                setFormData({ ...formData, channel: e.target.value })
              }
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push Notification</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t('crm.content', 'Conteúdo / Mensagem')}</Label>
            <Textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t('common.loading', 'Salvando...')
                : t('common.save', 'Salvar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
