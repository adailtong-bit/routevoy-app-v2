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
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useCrmData } from '@/hooks/use-crm-data'

const TEMPLATES = [
  {
    id: 'promo',
    name: 'Special Promotion',
    content:
      'Hi! We have a special promotion just for you. Use code PROMO20 to get 20% off your next purchase.',
  },
  {
    id: 'welcome',
    name: 'Welcome Message',
    content:
      'Welcome to our store! We are thrilled to have you here. Check out our latest arrivals.',
  },
  {
    id: 'abandoned',
    name: 'Cart Reminder',
    content:
      'You left something in your cart! Complete your purchase now and enjoy a 5% discount.',
  },
]

export function CampaignDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  companyId,
  franchiseId,
  affiliateId,
}: any) {
  const { targetGroups } = useCrmData(franchiseId, companyId, affiliateId)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    channel: 'email',
    status: 'draft',
    target_group_id: '',
    content: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        channel: initialData.channel || 'email',
        status: initialData.status || 'draft',
        target_group_id:
          initialData.target_group_id || initialData.targetGroupId || '',
        content: initialData.content || '',
      })
    } else {
      setFormData({
        name: '',
        channel: 'email',
        status: 'draft',
        target_group_id: '',
        content: '',
      })
    }
  }, [initialData, open])

  const handleTemplateChange = (templateId: string) => {
    if (!templateId) return
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setFormData((prev) => ({ ...prev, content: template.content }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        channel: formData.channel,
        status: formData.status,
        target_group_id: formData.target_group_id || null,
        content: formData.content,
        company_id: companyId,
        franchise_id: franchiseId,
        affiliate_id: affiliateId,
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
      toast.success('Campaign saved successfully')
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Campaign' : 'Create Campaign'}
          </DialogTitle>
          <DialogDescription>
            Configure your campaign details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Summer Sale"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <Label>Status</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Group</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.target_group_id}
              onChange={(e) =>
                setFormData({ ...formData, target_group_id: e.target.value })
              }
            >
              <option value="">All Users</option>
              {targetGroups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label>Load from Template (Optional)</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(e) => handleTemplateChange(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Select a template...
              </option>
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Content / Message</Label>
            <Textarea
              required
              rows={5}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Type your message here..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
