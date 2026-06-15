import { useState, useEffect } from 'react'
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
  const [formData, setFormData] = useState<any>({
    name: '',
    targetGroupId: targetGroups?.[0]?.id || '',
    channel: 'email',
    content: '',
    status: 'active',
    linkedOfferId: 'none',
  })

  const [promotions, setPromotions] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      let query = supabase
        .from('ad_campaigns')
        .select('id, title')
        .in('status', ['active', 'published'])

      if (companyId) {
        query = query.eq('company_id', companyId)
      } else if (franchiseId) {
        query = query.eq('franchise_id', franchiseId)
      }

      query.then(({ data }) => {
        if (data) setPromotions(data)
      })

      if (editingCampaign) {
        setFormData({
          name: editingCampaign.name || '',
          targetGroupId:
            editingCampaign.targetGroupId || targetGroups?.[0]?.id || '',
          channel: editingCampaign.channel || 'email',
          content: editingCampaign.content || '',
          status: editingCampaign.status || 'active',
          linkedOfferId: editingCampaign.linkedOfferId || 'none',
        })
      } else {
        setFormData({
          name: '',
          targetGroupId: targetGroups?.[0]?.id || '',
          channel: 'email',
          content: '',
          status: 'active',
          linkedOfferId: 'none',
        })
      }
    }
  }, [editingCampaign, targetGroups, open, companyId, franchiseId])

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
      linked_offer_id:
        formData.linkedOfferId === 'none' ? null : formData.linkedOfferId,
    }

    if (editingCampaign) {
      const { error } = await supabase
        .from('crm_campaigns')
        .update(payload)
        .eq('id', editingCampaign.id)
      if (error) {
        toast.error(t('common.error', 'An error occurred'))
        return
      }
    } else {
      const { error } = await supabase.from('crm_campaigns').insert([payload])
      if (error) {
        toast.error(t('common.error', 'An error occurred'))
        return
      }
    }

    toast.success(t('common.success', 'Success!'))
    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingCampaign
              ? t('crm.campaign.edit_title', 'Edit Campaign')
              : t('crm.campaign.create_title', 'New Campaign')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label>{t('crm.campaign.name', 'Campaign Name')} *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t('crm.campaign.name_ph', 'Ex: Summer Offer')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('crm.campaign.channel', 'Channel')}</Label>
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
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('crm.campaign.target_group', 'Target Group')}</Label>
              <Select
                value={formData.targetGroupId}
                onValueChange={(v) =>
                  setFormData({ ...formData, targetGroupId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select', 'Select...')} />
                </SelectTrigger>
                <SelectContent>
                  {targetGroups?.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('crm.campaign.status', 'Status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t('common.active', 'Active')}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t('common.inactive', 'Inactive')}
                  </SelectItem>
                  <SelectItem value="draft">
                    {t('admin.draft', 'Draft')}
                  </SelectItem>
                  <SelectItem value="paused">
                    {t('admin.paused', 'Paused')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('crm.campaign.link_offer', 'Linked Offer')}</Label>
              <Select
                value={formData.linkedOfferId}
                onValueChange={(v) =>
                  setFormData({ ...formData, linkedOfferId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.none', 'None')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {promotions.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {t(
                        'crm.campaign.no_active_offers',
                        'No active campaigns found.',
                      )}
                    </SelectItem>
                  ) : (
                    promotions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('crm.campaign.content', 'Content')}</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="h-28"
              placeholder={t('crm.campaign.content_ph', 'Message content...')}
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
