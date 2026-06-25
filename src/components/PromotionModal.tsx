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
import { useAuth } from '@/hooks/use-auth'

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
  const { profile } = useAuth()
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
    discount_percentage: '',
    category: '',
    location_name: '',
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
          discount_percentage:
            promotionToEdit.discount_percentage?.toString() || '',
          category: promotionToEdit.category || '',
          location_name:
            promotionToEdit.location_name ||
            promotionToEdit.store_name ||
            promotionToEdit.storeName ||
            '',
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
          promotionToEdit.image || promotionToEdit.image_url || null,
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
      discount_percentage: '',
      category: '',
      location_name: '',
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
      return toast.error('Título e Categoria são obrigatórios')

    setLoading(true)
    try {
      let imageUrl = promotionToEdit
        ? promotionToEdit.image || promotionToEdit.image_url
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
        discount_percentage: formData.discount_percentage
          ? parseFloat(formData.discount_percentage)
          : null,
        category: formData.category,
        location_name: formData.location_name || null,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        image: imageUrl,
        status: 'active',
        environment: 'production',
        is_seasonal: modality === 'seasonal',
        promotion_model: modality,
        reward_description: formData.reward_description || null,
        trigger_threshold: formData.trigger_threshold
          ? parseInt(formData.trigger_threshold, 10)
          : null,
        company_id: profile?.company_id || undefined,
      }

      if (promotionToEdit) {
        const { error } = await supabase
          .from('ad_campaigns')
          .update(payload)
          .eq('id', promotionToEdit.id)
        if (error) throw error
        toast.success('Promoção atualizada com sucesso!')
      } else {
        const { error } = await supabase.from('ad_campaigns').insert(payload)
        if (error) throw error
        toast.success('Promoção criada com sucesso!')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Falha ao salvar promoção')
    } finally {
      setLoading(false)
    }
  }

  const previewData = {
    id: 'preview',
    sourceId: 'preview',
    title: formData.title || 'Título da Promoção',
    description: formData.description || 'Descrição da promoção...',
    category: formData.category || 'Geral',
    storeName: formData.location_name || 'Nome do Local',
    price: formData.price ? parseFloat(formData.price) : undefined,
    originalPrice: formData.original_price
      ? parseFloat(formData.original_price)
      : undefined,
    discountPercentage: formData.discount_percentage
      ? parseFloat(formData.discount_percentage)
      : undefined,
    image: imagePreview || 'https://img.usecurling.com/p/400/300?q=shopping',
    imageUrl: imagePreview || 'https://img.usecurling.com/p/400/300?q=shopping',
    currency: 'BRL',
    status: 'active',
    region: 'BR',
    productLink: '#',
    isVerified: true,
    usageCount: 0,
    promotionModel: modality,
    rewardDescription: formData.reward_description,
  } as any

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>
            {promotionToEdit ? 'Editar Promoção' : 'Criar Promoção'}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes e veja a pré-visualização em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
          <div className="flex-1 md:overflow-y-auto p-6 scroll-smooth">
            <form id="promo-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Modalidade da Promoção</Label>
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
                      Padrão
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
                      Sazonal
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
                      Recompensa
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagem da Campanha</Label>
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
                            Alterar
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 gap-1">
                        <ImageOff className="h-6 w-6" />
                        <span className="text-[10px] uppercase font-bold">
                          Pré-visualização
                        </span>
                      </div>
                    )}
                    <input
                      id="image-overlay"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Enviar Imagem"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="image" className="sr-only">
                      Enviar Imagem
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer relative z-0"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Envie uma imagem de alta qualidade. Tamanho recomendado:
                      800x600px. Tamanho máx.: 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, category: v }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Categoria" />
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
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço Atual</Label>
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
                  <Label htmlFor="original_price">Preço Original</Label>
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
                  <Label htmlFor="discount_percentage">
                    Porcentagem de Desconto (%)
                  </Label>
                  <Input
                    id="discount_percentage"
                    name="discount_percentage"
                    type="number"
                    step="0.01"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    placeholder="ex. 50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_name">Nome do Local</Label>
                <Input
                  id="location_name"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleChange}
                />
              </div>

              {(modality === 'seasonal' ||
                formData.start_date ||
                formData.end_date) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Data de Início</Label>
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
                    <Label htmlFor="end_date">Data de Término</Label>
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
                      Descrição da Recompensa *
                    </Label>
                    <Input
                      id="reward_description"
                      name="reward_description"
                      value={formData.reward_description}
                      onChange={handleChange}
                      required
                      placeholder="ex. Sobremesa Grátis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger_threshold">
                      Ações Necessárias (Qtd) *
                    </Label>
                    <Input
                      id="trigger_threshold"
                      name="trigger_threshold"
                      type="number"
                      value={formData.trigger_threshold}
                      onChange={handleChange}
                      required
                      placeholder="ex. 5"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="w-full md:w-[350px] bg-slate-50 border-t md:border-t-0 md:border-l p-6 flex flex-col items-center shrink-0 md:overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider w-full text-center">
              Pré-visualização
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
            Cancelar
          </Button>
          <Button type="submit" form="promo-form" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Promoção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
