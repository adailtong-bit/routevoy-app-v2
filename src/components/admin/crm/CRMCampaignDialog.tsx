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

export function CRMCampaignDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
}) {
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
      const { error } = await supabase.from('crm_campaigns').insert({
        name: formData.name,
        channel: formData.channel,
        content: formData.content,
        status: 'active',
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create CRM Campaign</DialogTitle>
          <DialogDescription>
            Create a new automated CRM Campaign for the network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>CRM Campaign Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Global Summer Promo"
            />
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select
              value={formData.channel}
              onValueChange={(v) => setFormData({ ...formData, channel: v })}
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
            <Label>Content</Label>
            <Textarea
              required
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Your message here..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Create CRM Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
