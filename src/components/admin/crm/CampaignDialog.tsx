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

import { useEffect } from 'react'

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
  const [formData, setFormData] = useState<any>({
    name: '',
    targetGroupId: targetGroups?.[0]?.id || '',
    channel: 'email',
    content: '',
    status: 'active',
    description: '',
    discount: '',
    originalPrice: '',
    price: '',
    code: '',
  })

  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        name: editingCampaign.name || '',
        targetGroupId: editingCampaign.targetGroupId || '',
        channel: editingCampaign.channel || 'email',
        content: editingCampaign.content || '',
        status: editingCampaign.status || 'active',
        description: '',
        discount: '',
        originalPrice: '',
        price: '',
        code: '',
      })
      if (editingCampaign.linkedOfferId) {
        supabase
          .from('coupons')
          .select('*')
          .eq('id', editingCampaign.linkedOfferId)
          .single()
          .then(({ data }) => {
            if (data) {
              setFormData((prev: any) => ({
                ...prev,
                description: data.description || '',
                discount: data.discount || '',
                originalPrice: data.original_price || '',
                price: data.price || '',
                code: data.code || '',
              }))
            }
          })
      }
    } else {
      setFormData({
        name: '',
        targetGroupId: targetGroups?.[0]?.id || '',
        channel: 'email',
        content: '',
        status: 'active',
        description: '',
        discount: '',
        originalPrice: '',
        price: '',
        code: '',
      })
    }
  }, [editingCampaign, targetGroups, open])

  const handleSave = async () => {
    let linkedOfferId = editingCampaign?.linkedOfferId

    // Create or update the linked offer (coupon)
    const couponPayload = {
      title: formData.name,
      description: formData.description,
      discount: formData.discount,
      original_price: formData.originalPrice
        ? parseFloat(formData.originalPrice)
        : null,
      price: formData.price ? parseFloat(formData.price) : null,
      code: formData.code,
      status: formData.status,
      company_id: companyId || null,
      franchise_id: franchiseId || null,
      environment: 'production',
    }

    if (linkedOfferId) {
      await supabase
        .from('coupons')
        .update(couponPayload)
        .eq('id', linkedOfferId)
    } else {
      const { data: newCoupon } = await supabase
        .from('coupons')
        .insert([couponPayload])
        .select('id')
        .single()
      if (newCoupon) {
        linkedOfferId = newCoupon.id
      }
    }

    const payload = {
      name: formData.name,
      target_group_id: formData.targetGroupId || null,
      channel: formData.channel,
      content: formData.content,
      status: formData.status,
      company_id: companyId || null,
      franchise_id: franchiseId || null,
      affiliate_id: affiliateId || null,
      linked_offer_id: linkedOfferId || null,
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
        <div className="grid gap-4 py-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label>Title (Nome da Campanha) *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Oferta de Verão"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount</Label>
              <Input
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                placeholder="Ex: 20% OFF"
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Ex: VERAO20"
              />
            </div>
            <div className="space-y-2">
              <Label>Original Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Final Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Canal de Disparo</Label>
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
            <Label>Conteúdo da Mensagem (Email/WhatsApp)</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="h-28"
              placeholder="Olá, confira nossa nova oferta exclusiva para você!"
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
