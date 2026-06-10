import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  ImageOff,
  Utensils,
  Shirt,
  Briefcase,
  Smartphone,
  LayoutGrid,
  CalendarIcon,
  Gift,
} from 'lucide-react'
import { PromotionCard } from '@/components/PromotionCard'
import { DiscoveredPromotion } from '@/lib/types'

export function PromotionModal({
  open,
  onOpenChange,
  onSuccess,
  promotionToEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  promotionToEdit?: any
}) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [modality, setModality] = useState<'standard' | 'seasonal' | 'reward'>(
    'standard',
  )

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    discount: '',
    category: '',
    store_name: '',
    start_date: '',
    end_date: '',
    latitude: '',
    longitude: '',
    reward_description: '',
    trigger_threshold: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchCategories()
      if (promotionToEdit) {
        let mod: 'standard' | 'seasonal' | 'reward' = 'standard'
        if (promotionToEdit.promotion_model === 'reward') mod = 'reward'
        else if (promotionToEdit.is_seasonal) mod = 'seasonal'

        setModality(mod)
        setFormData({
          title: promotionToEdit.title || '',
          description: promotionToEdit.description || '',
          price: promotionToEdit.price?.toString() || '',
          original_price: promotionToEdit.original_price?.toString() || '',
          discount: promotionToEdit.discount || '',
          category: promotionToEdit.category || '',
          store_name:
            promotionToEdit.store_name || promotionToEdit.storeName || '',
          start_date: promotionToEdit.start_date
            ? new Date(promotionToEdit.start_date).toISOString().slice(0, 16)
            : '',
          end_date: promotionToEdit.end_date
            ? new Date(promotionToEdit.end_date).toISOString().slice(0, 16)
            : '',
          latitude:
            promotionToEdit.latitude?.toString() ||
            promotionToEdit.coordinates?.lat?.toString() ||
            '',
          longitude:
            promotionToEdit.longitude?.toString() ||
            promotionToEdit.coordinates?.lng?.toString() ||
            '',
          reward_description: promotionToEdit.reward_description || '',
          trigger_threshold:
            promotionToEdit.trigger_threshold?.toString() || '',
        })
        setImagePreview(
          promotionToEdit.image_url || promotionToEdit.image || null,
        )
        setImageFile(null)
      } else {
        resetForm()
      }
    } else {
      resetForm()
    }
  }, [open, promotionToEdit])

  const resetForm = () => {
    setModality('standard')
    setFormData({
      title: '',
      description: '',
      price: '',
      original_price: '',
      discount: '',
      category: '',
      store_name: '',
      start_date: '',
      end_date: '',
      latitude: '',
      longitude: '',
      reward_description: '',
      trigger_threshold: '',
    })
    setImageFile(null)
    setImagePreview(null)
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('label')
    if (data) setCategories(data)
  }

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-slate-500" />
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-slate-500" />
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-slate-500" />
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-slate-500" />
      default:
        return <LayoutGrid className="w-4 h-4 text-slate-500" />
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.category)
      return toast.error('Title and Category are required')

    setLoading(true)
    try {
      let imageUrl = promotionToEdit
        ? promotionToEdit.image_url || promotionToEdit.image
        : null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('promotions')
          .upload(fileName, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage
          .from('promotions')
          .getPublicUrl(fileName)
        imageUrl = publicUrlData.publicUrl
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        discount: formData.discount || null,
        category: formData.category,
        store_name: formData.store_name || null,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        image_url: imageUrl,
        status: 'published',
        environment: 'production',
        is_seasonal: modality === 'seasonal',
        promotion_model: modality,
        reward_description: formData.reward_description || null,
        trigger_threshold: formData.trigger_threshold
          ? parseInt(formData.trigger_threshold, 10)
          : null,
      }

      if (promotionToEdit) {
        const { error } = await supabase
          .from('discovered_promotions')
          .update(payload)
          .eq('id', promotionToEdit.id)
        if (error) throw error
        toast.success('Promotion updated successfully!')
      } else {
        const { error } = await supabase
          .from('discovered_promotions')
          .insert(payload)
        if (error) throw error
        toast.success('Promotion created successfully!')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save promotion')
    } finally {
      setLoading(false)
    }
  }

  const previewData = {
    id: 'preview',
    sourceId: 'preview',
    title: formData.title || 'Your Promotion Title',
    description: formData.description || 'Description of the promotion...',
    category: formData.category || 'General',
    storeName: formData.store_name || 'Store Name',
    price: formData.price ? parseFloat(formData.price) : undefined,
    originalPrice: formData.original_price
      ? parseFloat(formData.original_price)
      : undefined,
    discount: formData.discount || undefined,
    imageUrl: imagePreview || 'https://img.usecurling.com/p/400/300?q=shopping',
    currency: 'USD',
    status: 'published',
    region: 'US',
    productLink: '#',
    isVerified: true,
    usageCount: 0,
  } as DiscoveredPromotion

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>
            {promotionToEdit ? 'Edit Promotion' : 'Create Promotion'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details and see the preview in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
          <div className="flex-1 md:overflow-y-auto p-6 scroll-smooth">
            <form id="promo-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Promotion Modality</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setModality('standard')}
                    className={`p-3 sm:p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                      modality === 'standard'
                        ? 'border-primary bg-primary/5 shadow-sm text-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-semibold text-xs sm:text-sm">
                      Standard
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModality('seasonal')}
                    className={`p-3 sm:p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                      modality === 'seasonal'
                        ? 'border-primary bg-primary/5 shadow-sm text-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-semibold text-xs sm:text-sm">
                      Seasonal
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModality('reward')}
                    className={`p-3 sm:p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                      modality === 'reward'
                        ? 'border-primary bg-primary/5 shadow-sm text-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-semibold text-xs sm:text-sm">
                      Reward
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Campaign Image</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-32 w-32 sm:h-24 sm:w-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0 relative group">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            Change
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 gap-1">
                        <ImageOff className="h-6 w-6" />
                        <span className="text-[10px] uppercase font-bold">
                          Preview
                        </span>
                      </div>
                    )}
                    <input
                      id="image-overlay"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Upload image"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="image" className="sr-only">
                      Upload Image
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer relative z-0"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Upload a high-quality image. Recommended size: 800x600px.
                      Maximum size: 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, category: v }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(c.icon)}
                            <span>{c.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Current Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price</Label>
                  <Input
                    id="original_price"
                    name="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Badge</Label>
                  <Input
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="e.g. 50% OFF"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name</Label>
                <Input
                  id="store_name"
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleChange}
                />
              </div>

              {(modality === 'seasonal' ||
                formData.start_date ||
                formData.end_date) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={handleChange}
                      required={modality === 'seasonal'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={handleChange}
                      required={modality === 'seasonal'}
                    />
                  </div>
                </div>
              )}

              {modality === 'reward' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reward_description">
                      Reward Description *
                    </Label>
                    <Input
                      id="reward_description"
                      name="reward_description"
                      value={formData.reward_description}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Free Dessert"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger_threshold">
                      Required Actions *
                    </Label>
                    <Input
                      id="trigger_threshold"
                      name="trigger_threshold"
                      type="number"
                      value={formData.trigger_threshold}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="w-full md:w-[350px] bg-slate-50 border-t md:border-t-0 md:border-l p-6 flex flex-col items-center shrink-0 md:overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider w-full text-center">
              Live Preview
            </h3>
            <div className="w-full pointer-events-none">
              <PromotionCard promotion={previewData} />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="promo-form" disabled={loading}>
            {loading ? 'Saving...' : 'Save Promotion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
