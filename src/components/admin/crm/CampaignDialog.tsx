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
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  companyId?: string
  franchiseId?: string
  affiliateId?: string
  campaign?: any
}

export function CampaignDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
  franchiseId,
  affiliateId,
  campaign,
}: Props) {
  const [name, setName] = useState('')
  const [channel, setChannel] = useState('email')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [targetGroupId, setTargetGroupId] = useState<string>('all')
  const [groups, setGroups] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetchGroups()
      if (campaign) {
        setName(String(campaign.name || ''))
        setChannel(String(campaign.channel || 'email'))
        setContent(String(campaign.content || ''))
        setStatus(String(campaign.status || 'draft'))
        setTargetGroupId(
          campaign.target_group_id ? String(campaign.target_group_id) : 'all',
        )
      } else {
        setName('')
        setChannel('email')
        setContent('')
        setStatus('draft')
        setTargetGroupId('all')
      }
    }
  }, [open, campaign])

  const fetchGroups = async () => {
    let query = supabase.from('crm_target_groups').select('id, name')
    if (companyId) query = query.eq('company_id', companyId)
    else if (franchiseId) query = query.eq('franchise_id', franchiseId)
    else if (affiliateId) query = query.eq('affiliate_id', affiliateId)

    const { data } = await query
    if (data) setGroups(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name,
        channel,
        content,
        status,
        target_group_id: targetGroupId === 'all' ? null : targetGroupId,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        affiliate_id: affiliateId || null,
        geographic_scope: 'local',
      }

      if (campaign?.id) {
        const { error } = await supabase
          .from('crm_campaigns')
          .update(payload)
          .eq('id', campaign.id)
        if (error) throw error
        toast({ title: 'Campaign updated successfully' })
      } else {
        const { error } = await supabase.from('crm_campaigns').insert([payload])
        if (error) throw error
        toast({ title: 'Campaign created successfully' })
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Error saving campaign',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? 'Edit Campaign' : 'Create Campaign'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Campaign name"
            />
          </div>

          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
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
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Group</Label>
            <Select value={targetGroupId} onValueChange={setTargetGroupId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={String(g.id)} value={String(g.id)}>
                    {String(g.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content / Message</Label>
            <Textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[100px]"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
