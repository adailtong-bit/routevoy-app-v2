import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { LinkIcon, Copy } from 'lucide-react'

export function CRMCampaignDialog({
  open,
  onOpenChange,
  companyId,
  groups,
  editData,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId?: string
  groups: any[]
  editData?: any
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetGroupId: '',
    channel: 'email',
    content: '',
    linkedOfferId: 'none',
  })

  const [promotions, setPromotions] = useState<any[]>([])

  useEffect(() => {
    if (open && companyId) {
      supabase
        .from('ad_campaigns')
        .select('id, title')
        .eq('company_id', companyId)
        .then(({ data }) => {
          if (data) setPromotions(data)
        })
      if (editData) {
        setFormData({
          name: editData.name || '',
          targetGroupId: editData.target_group_id || '',
          channel: editData.channel || 'email',
          content: editData.content || '',
          linkedOfferId: editData.linked_offer_id || 'none',
        })
      } else {
        setFormData({
          name: '',
          targetGroupId: '',
          channel: 'email',
          content: '',
          linkedOfferId: 'none',
        })
      }
    }
  }, [open, companyId, editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.targetGroupId) {
      toast.error('Nome e Grupo Alvo são obrigatórios.')
      return
    }

    setLoading(true)

    const payload = {
      name: formData.name,
      company_id: companyId,
      target_group_id: formData.targetGroupId,
      channel: formData.channel,
      content: formData.content,
      linked_offer_id:
        formData.linkedOfferId === 'none' ? null : formData.linkedOfferId,
      is_exclusive: true,
      status: 'active',
    }

    if (editData) {
      const { error } = await supabase
        .from('crm_campaigns')
        .update(payload)
        .eq('id', editData.id)
      if (error) {
        toast.error('Erro ao atualizar campanha.')
      } else {
        toast.success('Campanha atualizada com sucesso!')
        onSuccess()
        onOpenChange(false)
      }
    } else {
      const { error } = await supabase.from('crm_campaigns').insert(payload)
      if (error) {
        toast.error('Erro ao criar campanha.')
      } else {
        toast.success('Campanha exclusiva criada com sucesso!')
        onSuccess()
        onOpenChange(false)
      }
    }

    setLoading(false)
  }

  const generatedLink = editData
    ? `https://routevoy.com/voucher/${formData.linkedOfferId}?ref=${editData.id}`
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editData
              ? 'Editar Campanha Direcionada'
              : 'Nova Campanha Direcionada'}
          </DialogTitle>
          <DialogDescription>
            Crie uma campanha exclusiva para um grupo de leads. Estas campanhas
            não aparecem na busca pública.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          id="crm-campaign-form"
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label>Nome da Campanha *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Ex: Oferta VIP Clientes Antigos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Grupo Alvo *</Label>
            <Select
              value={formData.targetGroupId}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, targetGroupId: v }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo de leads" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name} ({g.lead_count} leads)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Canal de Envio</Label>
              <Select
                value={formData.channel}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, channel: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vincular Oferta</Label>
              <Select
                value={formData.linkedOfferId}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, linkedOfferId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem oferta vinculada</SelectItem>
                  {promotions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo / Mensagem</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((p) => ({ ...p, content: e.target.value }))
              }
              placeholder="Olá [nome], temos uma oferta exclusiva para você..."
              className="h-24 resize-none"
            />
          </div>

          {editData && formData.linkedOfferId !== 'none' && (
            <div className="mt-4 p-3 bg-slate-50 border rounded-lg flex flex-col gap-2">
              <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Link Exclusivo de Rastreamento
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  readOnly
                  value={generatedLink}
                  className="h-9 bg-white text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink)
                    toast.success('Link copiado!')
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button form="crm-campaign-form" type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Campanha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
