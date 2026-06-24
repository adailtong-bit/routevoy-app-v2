import { useState, useEffect } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { MapPin, Image as ImageIcon, X } from 'lucide-react'

export function AdCampaignSheet({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
  editData?: any
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    location_name: '',
    latitude: '',
    longitude: '',
    alert_radius: 5000,
    budget: 0,
    category: '',
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || '',
        description: editData.description || '',
        image: editData.image || '',
        location_name: editData.location_name || '',
        latitude: editData.latitude || '',
        longitude: editData.longitude || '',
        alert_radius: editData.alert_radius || 5000,
        budget: editData.budget || 0,
        category: editData.category || '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        image: '',
        location_name: '',
        latitude: '',
        longitude: '',
        alert_radius: 5000,
        budget: 0,
        category: '',
      })
    }
  }, [editData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        location_name: formData.location_name,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        alert_radius: formData.alert_radius
          ? parseFloat(formData.alert_radius as any)
          : null,
        budget: formData.budget ? parseFloat(formData.budget as any) : null,
        category: formData.category,
        status: editData ? editData.status : 'active',
        environment: 'production',
      }

      if (editData?.id) {
        const { error } = await supabase
          .from('ad_campaigns')
          .update(payload)
          .eq('id', editData.id)
        if (error) throw error
        toast.success('Ad Campaign updated successfully')
      } else {
        const { error } = await supabase.from('ad_campaigns').insert(payload)
        if (error) throw error
        toast.success('Ad Campaign created successfully')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save Ad Campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-full md:max-w-[90vw] lg:max-w-[1000px] xl:max-w-[1200px] p-0 flex flex-col gap-0 border-l border-slate-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              {editData ? 'Edit Ad Campaign' : 'Create Ad Campaign'}
            </h2>
            <p className="text-sm text-slate-500">
              Manage your advertisement campaign details and preview it in
              real-time.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
          {/* Left Side: Form */}
          <div className="w-full md:w-1/2 overflow-y-auto p-6 border-b md:border-b-0 md:border-r">
            <form
              id="ad-campaign-form"
              onSubmit={handleSubmit}
              className="space-y-4 pb-12"
            >
              <div className="space-y-2">
                <Label>Campaign Title</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Summer Sale Ad"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Get 50% off all summer items..."
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Retail, Food, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: e.target.value as any,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <h4 className="text-sm font-medium mb-4">Location Targeting</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input
                      value={formData.location_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location_name: e.target.value,
                        })
                      }
                      placeholder="Downtown Store"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData({ ...formData, latitude: e.target.value })
                        }
                        placeholder="-23.5505"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value,
                          })
                        }
                        placeholder="-46.6333"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Alert Radius (meters)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.alert_radius}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alert_radius: e.target.value as any,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Side: Preview */}
          <div className="w-full md:w-1/2 bg-slate-50 p-6 overflow-y-auto flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-6 w-full text-center">
              Live Preview
            </h3>

            {/* Phone Mockup Wrapper */}
            <div className="w-[320px] bg-white rounded-[2rem] border-[8px] border-slate-900 shadow-xl overflow-hidden flex flex-col relative aspect-[9/19]">
              {/* Fake Status Bar */}
              <div className="h-6 w-full bg-slate-900 flex justify-center">
                <div className="w-1/3 h-full bg-black rounded-b-xl"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-slate-100 flex flex-col gap-4">
                {/* Simulated Feed Item */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 flex flex-col">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-40 object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="w-full h-40 bg-slate-200 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 leading-tight">
                        {formData.title || 'Campaign Title'}
                      </h4>
                      {formData.category && (
                        <span className="text-[10px] font-semibold uppercase bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                          {formData.category}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {formData.description ||
                        'Campaign description will appear here. Add details to engage your audience.'}
                    </p>

                    <div className="mt-auto pt-2 space-y-3">
                      {(formData.location_name ||
                        (formData.latitude && formData.longitude)) && (
                        <div className="flex items-center text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                          <span className="truncate">
                            {formData.location_name ||
                              `${formData.latitude}, ${formData.longitude}`}
                          </span>
                          {formData.alert_radius && (
                            <span className="ml-auto flex-shrink-0 text-slate-400">
                              ({formData.alert_radius}m)
                            </span>
                          )}
                        </div>
                      )}

                      <Button className="w-full" size="sm">
                        View Offer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="ad-campaign-form" disabled={loading}>
            {loading
              ? 'Saving...'
              : editData
                ? 'Save Changes'
                : 'Create Ad Campaign'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
