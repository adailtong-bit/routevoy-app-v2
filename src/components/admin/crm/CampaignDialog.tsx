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

export function CampaignDialog({
  open,
  onOpenChange,
  companyId,
  franchiseId,
  affiliateId,
  editData,
  onSuccess,
  targetGroups = [],
}: any) {
  const [formData, setFormData] = useState({
    name: '',
    channel: 'email',
    targetGroupId: 'global',
    content: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          name: editData.name || '',
          channel: editData.channel || 'email',
          targetGroupId: editData.targetGroupId || 'global',
          content: editData.content || '',
        })
      } else {
        setFormData({
          name: '',
          channel: 'email',
          targetGroupId: 'global',
          content: '',
        })
      }
    }
  }, [open, editData])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        channel: formData.channel,
        target_group_id:
          formData.targetGroupId === 'global' ? null : formData.targetGroupId,
        content: formData.content,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        affiliate_id: affiliateId || null,
      }

      if (editData) {
        await supabase
          .from('crm_campaigns')
          .update(payload)
          .eq('id', editData.id)
        toast.success('Campanha atualizada!')
      } else {
        await supabase.from('crm_campaigns').insert(payload)
        toast.success('Campanha criada!')
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Campanha</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <SelectItem value="sms">SMS</SelectItem>
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Todos (Global)</SelectItem>
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
              className="h-32"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
