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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

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
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetGroupId: '',
    channel: 'email',
    geographicScope: 'local',
    randomizationType: 'none',
    randomizationValue: '',
    content: '',
    isExclusive: true,
    linkedOfferId: 'none',
    scheduledAt: '',
    status: 'active',
  })

  const [promotions, setPromotions] = useState<any[]>([])

  useEffect(() => {
    if (open && companyId) {
      supabase
        .from('ad_campaigns')
        .select('id, title')
        .eq('company_id', companyId)
        .in('status', ['active', 'published'])
        .then(({ data }) => {
          if (data) setPromotions(data)
        })

      if (editData) {
        setFormData({
          name: editData.name || '',
          targetGroupId: editData.target_group_id || '',
          channel: editData.channel || 'email',
          geographicScope: editData.geographic_scope || 'local',
          randomizationType: editData.randomization_type || 'none',
          randomizationValue: editData.randomization_value
            ? editData.randomization_value.toString()
            : '',
          content: editData.content || '',
          isExclusive: editData.is_exclusive ?? true,
          linkedOfferId: editData.linked_offer_id || 'none',
          scheduledAt: editData.scheduled_at
            ? new Date(editData.scheduled_at).toISOString().slice(0, 16)
            : '',
          status: editData.status || 'active',
        })
      } else {
        setFormData({
          name: '',
          targetGroupId: '',
          channel: 'email',
          geographicScope: 'local',
          randomizationType: 'none',
          randomizationValue: '',
          content: '',
          isExclusive: true,
          linkedOfferId: 'none',
          scheduledAt: '',
          status: 'active',
        })
      }
    }
  }, [open, companyId, editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.targetGroupId) {
      toast.error(
        t(
          'crm.campaign.required',
          'Campaign Name and Target Group are required.',
        ),
      )
      return
    }

    setLoading(true)

    const payload = {
      name: formData.name,
      company_id: companyId,
      target_group_id: formData.targetGroupId,
      channel: formData.channel,
      geographic_scope: formData.geographicScope,
      randomization_type:
        formData.randomizationType === 'none'
          ? null
          : formData.randomizationType,
      randomization_value: formData.randomizationValue
        ? Number(formData.randomizationValue)
        : null,
      content: formData.content,
      linked_offer_id:
        formData.linkedOfferId === 'none' ? null : formData.linkedOfferId,
      is_exclusive: formData.isExclusive,
      status: formData.status,
      scheduled_at: formData.scheduledAt || null,
    }

    if (editData) {
      const { error } = await supabase
        .from('crm_campaigns')
        .update(payload)
        .eq('id', editData.id)
      if (error) {
        toast.error(t('crm.campaign.update_error', 'Error updating campaign.'))
      } else {
        toast.success(
          t('crm.campaign.update_success', 'Campaign updated successfully!'),
        )
        onSuccess()
        onOpenChange(false)
      }
    } else {
      const { error } = await supabase.from('crm_campaigns').insert(payload)
      if (error) {
        toast.error(t('crm.campaign.create_error', 'Error creating campaign.'))
      } else {
        toast.success(
          t(
            'crm.campaign.create_success',
            'Exclusive campaign created successfully!',
          ),
        )
        onSuccess()
        onOpenChange(false)
      }
    }

    setLoading(false)
  }

  const generatedLink =
    editData && formData.linkedOfferId !== 'none'
      ? `https://routevoy.com/voucher/${formData.linkedOfferId}?ref=${editData.id}`
      : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData
              ? t('crm.campaign.edit_title', 'Edit Targeted Campaign')
              : t('crm.campaign.new_title', 'New Targeted Campaign')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'crm.campaign.description',
              'Create an exclusive campaign for a group of leads. These campaigns do not appear in public search.',
            )}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          id="crm-campaign-form"
          className="space-y-4 py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('crm.campaign.name', 'Campaign Name')} *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t('crm.campaign.name_ph', 'Ex: VIP Offers')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t('crm.campaign.target_group', 'Target Group')} *</Label>
              <Select
                value={formData.targetGroupId}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, targetGroupId: v }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'crm.campaign.select_group',
                      'Select lead group',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.lead_count || 0} leads)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('crm.campaign.channel', 'Channel')}</Label>
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
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('crm.campaign.link_offer', 'Link Offer')}</Label>
              <Select
                value={formData.linkedOfferId}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, linkedOfferId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('crm.campaign.none', 'None')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('crm.campaign.no_linked_offer', 'No linked offer')}
                  </SelectItem>
                  {promotions.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {t(
                        'crm.campaign.no_active_offers',
                        'No active offers found. Please create a standard campaign first.',
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t('crm.campaign.geographic_scope', 'Geographic Scope')}
              </Label>
              <Select
                value={formData.geographicScope}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, geographicScope: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">
                    {t('crm.campaign.scope_local', 'Local')}
                  </SelectItem>
                  <SelectItem value="state">
                    {t('crm.campaign.scope_state', 'State')}
                  </SelectItem>
                  <SelectItem value="national">
                    {t('crm.campaign.scope_national', 'National')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('crm.campaign.scheduled_at', 'Scheduled At')}</Label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, scheduledAt: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t('crm.campaign.randomization_type', 'Randomization Type')}
              </Label>
              <Select
                value={formData.randomizationType}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, randomizationType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('crm.campaign.none', 'None')}
                  </SelectItem>
                  <SelectItem value="percentage">
                    {t('crm.campaign.rand_percentage', 'Percentage')}
                  </SelectItem>
                  <SelectItem value="absolute">
                    {t('crm.campaign.rand_absolute', 'Absolute')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.randomizationType !== 'none' && (
              <div className="space-y-2">
                <Label>
                  {t('crm.campaign.randomization_value', 'Randomization Value')}
                </Label>
                <Input
                  type="number"
                  value={formData.randomizationValue}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      randomizationValue: e.target.value,
                    }))
                  }
                  placeholder="Ex: 50"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('crm.campaign.content', 'Content')}</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((p) => ({ ...p, content: e.target.value }))
              }
              placeholder={t(
                'crm.campaign.content_ph',
                'Hello [name], we have an exclusive offer for you...',
              )}
              className="h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
              <div className="space-y-0.5">
                <Label>{t('crm.campaign.exclusive', 'Exclusive')}</Label>
                <p className="text-xs text-slate-500">
                  {t('crm.campaign.exclusive_help', 'Hidden from public feed')}
                </p>
              </div>
              <Switch
                checked={formData.isExclusive}
                onCheckedChange={(c) =>
                  setFormData((p) => ({ ...p, isExclusive: c }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t('crm.campaign.status', 'Status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    {t('crm.campaign.status_draft', 'Draft')}
                  </SelectItem>
                  <SelectItem value="active">
                    {t('crm.campaign.status_active', 'Active')}
                  </SelectItem>
                  <SelectItem value="paused">
                    {t('crm.campaign.status_paused', 'Paused')}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t('crm.campaign.status_completed', 'Completed')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {editData && formData.linkedOfferId !== 'none' && generatedLink && (
            <div className="mt-4 p-3 bg-slate-50 border rounded-lg flex flex-col gap-2">
              <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                {t('crm.campaign.tracking_link', 'Exclusive Tracking Link')}
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
                  className="h-9 px-3 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink)
                    toast.success(t('crm.campaign.link_copied', 'Link copied!'))
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
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button form="crm-campaign-form" type="submit" disabled={loading}>
            {loading
              ? t('common.saving', 'Saving...')
              : editData
                ? t('common.save', 'Save')
                : t('crm.campaign.create', 'Create Campaign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
