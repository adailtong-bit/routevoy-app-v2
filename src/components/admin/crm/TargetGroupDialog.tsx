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

export function TargetGroupDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  companyId,
  franchiseId,
  affiliateId,
}: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filters: {
      city: '',
      state: '',
      gender: '',
      vipStatus: 'all',
    },
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        filters: initialData.filters || {
          city: '',
          state: '',
          gender: '',
          vipStatus: 'all',
        },
      })
    } else {
      setFormData({
        name: '',
        description: '',
        filters: {
          city: '',
          state: '',
          gender: '',
          vipStatus: 'all',
        },
      })
    }
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        filters: formData.filters,
        company_id: companyId,
        franchise_id: franchiseId,
        affiliate_id: affiliateId,
      }

      let error
      if (initialData?.id) {
        const res = await supabase
          .from('crm_target_groups')
          .update(payload)
          .eq('id', initialData.id)
        error = res.error
      } else {
        const res = await supabase.from('crm_target_groups').insert(payload)
        error = res.error
      }

      if (error) throw error
      toast.success('Target group saved successfully')
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Target Group' : 'Create Target Group'}
          </DialogTitle>
          <DialogDescription>
            Define your audience segmentation rules based on Profile data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. VIP Customers"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Group details..."
            />
          </div>
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">
              Segmentation Filters (People)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={formData.filters.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, city: e.target.value },
                    })
                  }
                  placeholder="e.g. São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={formData.filters.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, state: e.target.value },
                    })
                  }
                  placeholder="e.g. SP"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.filters.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, gender: e.target.value },
                    })
                  }
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>VIP Status</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.filters.vipStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: {
                        ...formData.filters,
                        vipStatus: e.target.value,
                      },
                    })
                  }
                >
                  <option value="all">All</option>
                  <option value="vip">Only VIP</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
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
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
