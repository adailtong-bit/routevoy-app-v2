import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useAuth } from '@/hooks/use-auth'

export function CRMCampaignDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
}) {
  const { companyId, franchiseId, affiliateId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    channel: 'email',
    content: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const isValidUUID = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id,
        )
      const { error } = await supabase.from('crm_campaigns').insert({
        name: formData.name,
        channel: formData.channel,
        content: formData.content,
        status: 'active',
        company_id: companyId ? companyId : null,
        franchise_id: franchiseId || null,
        affiliate_id:
          affiliateId && isValidUUID(affiliateId) ? affiliateId : null,
      })
      if (error) throw error
      toast.success('CRM Campaign created successfully')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create CRM Campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <DialogTitle className="text-xl text-slate-800">
            Create CRM Campaign
          </DialogTitle>
          <DialogDescription>
            Configure communication channel, target audiences, and content for
            your CRM campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="crm-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Title *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Welcome Series"
                />
              </div>
              <div className="space-y-2">
                <Label>Communication Channel *</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(v) =>
                    setFormData({ ...formData, channel: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message Content *</Label>
                <Textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Your message here..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </form>
        </div>
        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="crm-form" disabled={loading}>
            {loading ? 'Saving...' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
