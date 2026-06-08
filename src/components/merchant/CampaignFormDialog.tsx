import { useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { saveDiscoveredPromotion } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useCouponStore } from '@/stores/CouponContext'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
}) {
  const { role } = useAuth()
  const { companies } = useCouponStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    isSeasonal: false,
  })

  const myCompany = companies.find((c) => c.id === companyId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.isSeasonal && (!formData.startDate || !formData.endDate)) {
      toast.error('Seasonal campaigns require both start and end dates.')
      return
    }

    if (
      role !== 'merchant' &&
      role !== 'admin' &&
      role !== 'super_admin' &&
      role !== 'shopkeeper'
    ) {
      toast.error('Unauthorized to create campaigns.')
      return
    }

    setLoading(true)
    try {
      const startIso = formData.startDate
        ? new Date(formData.startDate).toISOString()
        : undefined
      const endIso = formData.endDate
        ? new Date(formData.endDate).toISOString()
        : undefined

      await saveDiscoveredPromotion({
        title: formData.title,
        description: formData.description,
        imageUrl:
          formData.imageUrl ||
          'https://img.usecurling.com/p/800/400?q=campaign',
        startDate: startIso,
        endDate: endIso,
        isSeasonal: formData.isSeasonal,
        companyId,
        status: 'published',
        storeName: myCompany?.name || 'Merchant Store',
      })

      toast.success('Campaign created successfully!')
      onOpenChange(false)
      // reset form
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        startDate: '',
        endDate: '',
        isSeasonal: false,
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to create campaign.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Promotion</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new promotion or campaign.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              placeholder="https://..."
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
            />
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Switch
              id="isSeasonal"
              checked={formData.isSeasonal}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isSeasonal: checked })
              }
            />
            <Label htmlFor="isSeasonal" className="font-semibold">
              Mark as Seasonal Campaign
            </Label>
          </div>

          {formData.isSeasonal && (
            <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-slate-50">
              <div className="space-y-2">
                <Label htmlFor="startDateSeasonal">Start Date *</Label>
                <Input
                  id="startDateSeasonal"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDateSeasonal">End Date *</Label>
                <Input
                  id="endDateSeasonal"
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {!formData.isSeasonal && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
