import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function CampaignDialog({
  open,
  onOpenChange,
  editingCampaign,
  targetGroups,
  companyId,
  franchiseId,
  affiliateId,
  onSaved,
}: any) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<any>(
    editingCampaign || {
      name: '',
      targetGroupId: targetGroups[0]?.id || '',
      channel: 'email',
      content: '',
      status: 'active',
    },
  )

  const handleSave = async () => {
    const payload = {
      name: formData.name,
      target_group_id: formData.targetGroupId || null,
      channel: formData.channel,
      content: formData.content,
      status: formData.status,
      company_id: companyId || null,
      franchise_id: franchiseId || null,
      affiliate_id: affiliateId || null,
    }

    if (editingCampaign) {
      await supabase
        .from('crm_campaigns')
        .update(payload)
        .eq('id', editingCampaign.id)
    } else {
      await supabase.from('crm_campaigns').insert([payload])
    }

    toast.success('Campanha salva com sucesso!')
    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Campanha</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Canal</Label>
              <Select
                value={formData.channel}
                onValueChange={(v) => setFormData({ ...formData, channel: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Grupo Alvo</Label>
              <Select
                value={formData.targetGroupId}
                onValueChange={(v) =>
                  setFormData({ ...formData, targetGroupId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {targetGroups.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Conteúdo da Mensagem</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="h-28"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.content}
          >
            {t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
