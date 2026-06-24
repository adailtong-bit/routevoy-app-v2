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
  group?: any
}

export function TargetGroupDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
  franchiseId,
  affiliateId,
  group,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && group) {
      setName(String(group.name || ''))
      setDescription(String(group.description || ''))
    } else if (open) {
      setName('')
      setDescription('')
    }
  }, [open, group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name,
        description,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        affiliate_id: affiliateId || null,
        filters: {},
      }

      if (group?.id) {
        const { error } = await supabase
          .from('crm_target_groups')
          .update(payload)
          .eq('id', group.id)
        if (error) throw error
        toast({ title: 'Group updated successfully' })
      } else {
        const { error } = await supabase
          .from('crm_target_groups')
          .insert([payload])
        if (error) throw error
        toast({ title: 'Group created successfully' })
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Error saving group',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {group ? 'Edit Target Group' : 'Create Target Group'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. VIP Customers"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Group details..."
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
