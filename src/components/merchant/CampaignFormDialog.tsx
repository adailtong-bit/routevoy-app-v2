import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PromotionCard } from '@/components/PromotionCard'
import { DiscoveredPromotion } from '@/lib/types'
import { ImageOff, Tag, Percent, Gift } from 'lucide-react'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modality: 'price_based' as 'price_based' | 'discount_only' | 'bogo',
    originalPrice: '',
    price: '',
    discountLabel: '',
    link: '',
    category: '',
    isSeasonal: false,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchCategories()
      resetForm()
    }
  }, [open])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('label')
    if (data) setCategories(data)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      modality: 'price_based',
      originalPrice: '',
      price: '',
      discountLabel: '',
      link: '',
      category: '',
      isSeasonal: false,
    })
    setImageFile(null)
    setImagePreview(null)
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
    if (!formData.title || !formData.category) {
      return toast.error('Título e Categoria são obrigatórios')
    }

    setLoading(true)
    try {
      let imageUrl = null
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

      let promoModel = 'standard'
      let finalDiscount = formData.discountLabel
      if (formData.modality === 'price_based') promoModel = 'price_comparison'
      if (formData.modality === 'discount_only') promoModel = 'pure_discount'
      if (formData.modality === 'bogo') {
        promoModel = 'buy_x_get_y'
        finalDiscount = 'Leve 2 Pague 1'
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        product_link: formData.link || null,
        category: formData.category,
        is_seasonal: formData.isSeasonal,
        company_id: companyId,
        image_url: imageUrl,
        promotion_model: promoModel,
        status: 'published',
        environment: 'production',
      } as any

      if (formData.modality === 'price_based') {
        if (formData.originalPrice)
          payload.original_price = parseFloat(formData.originalPrice)
        if (formData.price) payload.price = parseFloat(formData.price)
        if (finalDiscount) payload.discount = finalDiscount
      } else if (formData.modality === 'discount_only') {
        if (finalDiscount) payload.discount = finalDiscount
      } else if (formData.modality === 'bogo') {
        payload.discount = finalDiscount
      }

      const { error } = await supabase
        .from('discovered_promotions')
        .insert(payload)
      if (error) throw error

      toast.success('Campanha criada com sucesso!')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar campanha')
    } finally {
      setLoading(false)
    }
  }

  const previewData = {
    id: 'preview',
    sourceId: 'preview',
    title: formData.title || 'Título da Campanha',
    description: formData.description || 'Sua descrição aparecerá aqui...',
    category: formData.category || 'Geral',
    storeName: 'Sua Loja',
    price:
      formData.modality === 'price_based' && formData.price
        ? parseFloat(formData.price)
        : undefined,
    originalPrice:
      formData.modality === 'price_based' && formData.originalPrice
        ? parseFloat(formData.originalPrice)
        : undefined,
    discount:
      formData.modality === 'bogo'
        ? 'Leve 2 Pague 1'
        : formData.discountLabel || undefined,
    imageUrl: imagePreview || 'https://img.usecurling.com/p/400/300?q=shopping',
    currency: 'BRL',
    status: 'published',
    region: 'BR',
    productLink: formData.link || '#',
    isVerified: true,
    usageCount: 0,
    promotionModel:
      formData.modality === 'price_based'
        ? 'price_comparison'
        : formData.modality === 'discount_only'
          ? 'pure_discount'
          : 'buy_x_get_y',
  } as DiscoveredPromotion

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Criar Nova Campanha</DialogTitle>
          <DialogDescription>
            Configure sua campanha e veja o preview em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
          <div className="flex-1 md:overflow-y-auto p-6 scroll-smooth">
            <form
              id="campaign-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label>Imagem da Campanha</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0 relative group">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="h-6 w-6 text-slate-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Recomendado: 800x600px. Máx: 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Mega Promoção de Inverno"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva os detalhes da oferta..."
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
                      <SelectValue placeholder="Selecione uma categoria" />
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
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label>Modalidade de Desconto</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, modality: 'price_based' }))
                    }
                    className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                      formData.modality === 'price_based'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Tag className="w-5 h-5" />
                    <span className="font-semibold text-sm">
                      Baseado em Preço
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, modality: 'discount_only' }))
                    }
                    className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                      formData.modality === 'discount_only'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Percent className="w-5 h-5" />
                    <span className="font-semibold text-sm">
                      Apenas Desconto
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, modality: 'bogo' }))
                    }
                    className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                      formData.modality === 'bogo'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Gift className="w-5 h-5" />
                    <span className="font-semibold text-sm">
                      Leve 2 Pague 1
                    </span>
                  </button>
                </div>

                <div className="pt-2">
                  {formData.modality === 'price_based' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label>Preço Original</Label>
                        <Input
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={handleChange}
                          placeholder="Ex: 100.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Preço com Desconto</Label>
                        <Input
                          name="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="Ex: 80.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Selo de Desconto</Label>
                        <Input
                          name="discountLabel"
                          value={formData.discountLabel}
                          onChange={handleChange}
                          placeholder="Ex: 20% OFF"
                        />
                      </div>
                    </div>
                  )}
                  {formData.modality === 'discount_only' && (
                    <div className="space-y-2 animate-fade-in">
                      <Label>Valor do Desconto</Label>
                      <Input
                        name="discountLabel"
                        value={formData.discountLabel}
                        onChange={handleChange}
                        placeholder="Ex: 50% OFF ou R$ 50"
                        required
                      />
                    </div>
                  )}
                  {formData.modality === 'bogo' && (
                    <div className="p-4 bg-slate-50 rounded-lg border text-sm text-slate-600 animate-fade-in">
                      A campanha será exibida com o destaque "Leve 2 Pague 1".
                      Nenhum preço específico é necessário, mas você pode
                      adicionar mais informações na descrição.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>URL da Promoção (Opcional)</Label>
                  <Input
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Campanha Sazonal</Label>
                    <p className="text-xs text-slate-500">
                      Marque se for relacionada a eventos (Natal, Black Friday,
                      etc)
                    </p>
                  </div>
                  <Switch
                    checked={formData.isSeasonal}
                    onCheckedChange={(c) =>
                      setFormData((p) => ({ ...p, isSeasonal: c }))
                    }
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="w-full md:w-[350px] bg-slate-50 border-t md:border-t-0 md:border-l p-6 flex flex-col items-center shrink-0 md:overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider w-full text-center">
              Preview da Campanha
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
          <Button type="submit" form="campaign-form" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Campanha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
