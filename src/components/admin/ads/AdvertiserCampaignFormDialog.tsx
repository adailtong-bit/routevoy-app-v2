import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

export function AdvertiserCampaignFormDialog({
  open,
  onOpenChange,
  franchiseId,
  environment = 'production',
  onSuccess,
  editData,
  advertisers,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  franchiseId?: string
  environment?: string
  onSuccess?: () => void
  editData?: any
  advertisers: any[]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [placements, setPlacements] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedAdvertiser, setSelectedAdvertiser] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    image: '',
    link: '',
    description: '',
    placement: '',
    category: '',
    start_date: '',
    end_date: '',
    status: 'active',
  })

  useEffect(() => {
    if (!open) return
    fetchPlacements()
    fetchCategories()
    if (editData) {
      setForm({
        title: editData.title || '',
        image: editData.image || '',
        link: editData.link || '',
        description: editData.description || '',
        placement: editData.placement || '',
        category: editData.category || '',
        start_date: editData.start_date
          ? editData.start_date.split('T')[0]
          : '',
        end_date: editData.end_date ? editData.end_date.split('T')[0] : '',
        status: editData.status || 'active',
      })
      setSelectedAdvertiser(editData.advertiser_id || '')
    } else {
      setForm({
        title: '',
        image: '',
        link: '',
        description: '',
        placement: '',
        category: '',
        start_date: '',
        end_date: '',
        status: 'active',
      })
      setSelectedAdvertiser('')
    }
  }, [open, editData])

  const fetchPlacements = async () => {
    const { data } = await supabase
      .from('ad_pricing')
      .select('placement, billing_type, price')
      .eq('environment', environment)
      .order('placement')
    if (data) {
      const unique = Array.from(
        new Map(data.map((p: any) => [p.placement, p])).values(),
      )
      setPlacements(unique)
    }
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, label')
      .eq('status', 'active')
      .order('label')
    if (data) setCategories(data)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG and WEBP are allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB.')
      return
    }
    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `advertiser_${Date.now()}.${fileExt}`
      const { error } = await supabase.storage
        .from('ad-campaigns')
        .upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage
        .from('ad-campaigns')
        .getPublicUrl(fileName)
      setForm({ ...form, image: urlData.publicUrl })
      toast.success('Banner uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload banner')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required')
    if (!selectedAdvertiser) return toast.error('Please select an advertiser')
    if (!form.link) return toast.error('Destination URL is required')
    if (!form.placement) return toast.error('Please select a placement')

    setIsLoading(true)
    const payload = {
      title: form.title,
      advertiser_id: selectedAdvertiser,
      franchise_id: franchiseId || null,
      image: form.image || null,
      link: form.link,
      description: form.description || null,
      placement: form.placement,
      category: form.category || null,
      start_date: form.start_date
        ? new Date(form.start_date).toISOString()
        : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      status: form.status,
      environment,
      billing_type: 'fixed',
    }

    let error
    if (editData) {
      const res = await supabase
        .from('ad_campaigns')
        .update(payload)
        .eq('id', editData.id)
      error = res.error
    } else {
      const res = await supabase.from('ad_campaigns').insert(payload)
      error = res.error
    }

    setIsLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(editData ? 'Campaign updated' : 'Campaign created')
      onOpenChange(false)
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {editData ? 'Edit Advertiser Campaign' : 'New Advertiser Campaign'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Campaign Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Advertiser *</Label>
              <Select
                value={selectedAdvertiser || undefined}
                onValueChange={setSelectedAdvertiser}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select advertiser..." />
                </SelectTrigger>
                <SelectContent>
                  {advertisers.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Placement *</Label>
              <Select
                value={form.placement || undefined}
                onValueChange={(v) => setForm({ ...form, placement: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select placement..." />
                </SelectTrigger>
                <SelectContent>
                  {placements.map((p) => (
                    <SelectItem key={p.placement} value={p.placement}>
                      {p.placement.replace(/_/g, ' ')} ({p.billing_type} - $
                      {p.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category || undefined}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Destination URL *</Label>
              <Input
                placeholder="https://..."
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Banner Image</Label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
            />
            {form.image ? (
              <div className="relative group h-32 w-full rounded-md border overflow-hidden">
                <img
                  src={form.image}
                  alt="Banner"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setForm({ ...form, image: '' })}
                  >
                    <X className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-32 w-full rounded-md border-2 border-dashed hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 bg-slate-50 transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 mb-2 animate-spin text-primary" />
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-sm font-medium">
                      Click to upload banner
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500">
              Recommended size: 1200x600px (Horizontal) or 1080x1920px (Story),
              Max weight: 2MB
            </p>
          </div>
        </div>
        <div className="p-6 pt-4 border-t flex justify-end gap-3 bg-slate-50/50 rounded-b-lg shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isUploading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editData ? 'Update' : 'Create'} Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
