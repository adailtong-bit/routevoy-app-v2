import { useState, useEffect, useRef } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { fetchCategories, saveDiscoveredPromotion } from '@/lib/api'
import { toast } from 'sonner'
import { UploadCloud, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function AdminPromotionDialog({
  open,
  onOpenChange,
  onSuccess,
  promotion,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  promotion?: any
}) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    storeName: '',
    originalPrice: '',
    currentPrice: '',
    productLink: '',
    imageUrl: '',
    category: '',
    description: '',
    isSeasonal: false,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      loadCategories()
      if (promotion) {
        setFormData({
          title: promotion.title || '',
          storeName: promotion.storeName || promotion.store_name || '',
          originalPrice:
            promotion.originalPrice || promotion.original_price || '',
          currentPrice: promotion.currentPrice || promotion.price || '',
          productLink: promotion.productLink || promotion.product_link || '',
          imageUrl: promotion.imageUrl || promotion.image_url || '',
          category: promotion.category || '',
          description: promotion.description || '',
          isSeasonal: promotion.isSeasonal || promotion.is_seasonal || false,
        })
      } else {
        setFormData({
          title: '',
          storeName: '',
          originalPrice: '',
          currentPrice: '',
          productLink: '',
          imageUrl: '',
          category: '',
          description: '',
          isSeasonal: false,
        })
      }
    }
  }, [open, promotion])

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories()
      // Filter for active ones if needed, assuming API returns all valid categories
      setCategories(cats)
    } catch (e) {
      console.error('Failed to load categories', e)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('promotions')
        .upload(filePath, file)

      if (uploadError) {
        // Fallback to local object URL for preview if bucket is not configured
        const objectUrl = URL.createObjectURL(file)
        handleChange('imageUrl', objectUrl)
        toast.success('Image preview generated (Storage bucket not found)')
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from('promotions').getPublicUrl(filePath)

        handleChange('imageUrl', publicUrl)
        toast.success('Image uploaded successfully')
      }
    } catch (err: any) {
      toast.error('Failed to upload image')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.storeName ||
      !formData.currentPrice ||
      !formData.productLink ||
      !formData.imageUrl ||
      !formData.category
    ) {
      toast.error(
        'Required field missing. Please fill in all fields marked with *.',
      )
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: formData.title,
        storeName: formData.storeName,
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice)
          : undefined,
        price: Number(formData.currentPrice),
        productLink: formData.productLink,
        imageUrl: formData.imageUrl,
        category: formData.category,
        description: formData.description,
        isSeasonal: formData.isSeasonal,
        status: 'published',
      }

      await saveDiscoveredPromotion(payload)

      toast.success('Promotion saved successfully!')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (e: any) {
      toast.error('Error saving promotion: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Promotion</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new promotion
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="Enter promotion title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Store Name *</Label>
            <Input
              placeholder="Enter store name"
              value={formData.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Original Price</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.originalPrice}
              onChange={(e) => handleChange('originalPrice', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Current Price *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.currentPrice}
              onChange={(e) => handleChange('currentPrice', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Product Link *</Label>
            <Input
              placeholder="https://"
              value={formData.productLink}
              onChange={(e) => handleChange('productLink', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Image URL *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
                className="shrink-0"
                disabled={loading}
              >
                <UploadCloud className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => handleChange('category', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Campaign Description</Label>
            <Textarea
              placeholder="Describe your campaign..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between md:col-span-2 p-3 border rounded-lg bg-slate-50">
            <div className="space-y-0.5">
              <Label>Seasonal</Label>
              <p className="text-sm text-slate-500">
                Mark as a seasonal or holiday offer.
              </p>
            </div>
            <Switch
              checked={formData.isSeasonal}
              onCheckedChange={(v) => handleChange('isSeasonal', v)}
            />
          </div>

          {formData.imageUrl && (
            <div className="space-y-2 md:col-span-2">
              <Label>Image Preview</Label>
              <div className="w-full h-48 border rounded-lg overflow-hidden flex items-center justify-center bg-slate-100 relative">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove(
                      'hidden',
                    )
                  }}
                  onLoad={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'block'
                    e.currentTarget.nextElementSibling?.classList.add('hidden')
                  }}
                />
                <div className="hidden flex-col items-center justify-center text-slate-400 absolute inset-0">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Invalid Image URL</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Promotion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
