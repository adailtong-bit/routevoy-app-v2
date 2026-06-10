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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PromotionCard } from '@/components/PromotionCard'
import { DiscoveredPromotion } from '@/lib/types'
import { ImageOff } from 'lucide-react'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
  editData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess: () => void
  editData?: any
}) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    productLink: '',
    imageUrl: '',
    originalPrice: '',
    price: '',
    discountPercentage: '',
    latitude: '',
    longitude: '',
    locationName: '',
    alertRadius: '500',
    rewardType: '',
    rewardValue: '',
    rewardDescription: '',
    enableTrigger: false,
    triggerType: '',
    triggerThreshold: '',
    startDate: '',
    endDate: '',
    totalLimit: '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchCategories()
      if (editData) {
        setFormData({
          title: editData.title || '',
          description: editData.description || '',
          category: editData.category || '',
          productLink: editData.link || '',
          imageUrl: editData.image || '',
          originalPrice: editData.original_price
            ? editData.original_price.toString()
            : '',
          price: editData.price ? editData.price.toString() : '',
          discountPercentage: editData.discount_percentage
            ? editData.discount_percentage.toString()
            : '',
          latitude: editData.latitude ? editData.latitude.toString() : '',
          longitude: editData.longitude ? editData.longitude.toString() : '',
          locationName: editData.location_name || '',
          alertRadius: editData.alert_radius
            ? editData.alert_radius.toString()
            : '500',
          rewardType: editData.reward_type || '',
          rewardValue: editData.reward_value
            ? editData.reward_value.toString()
            : '',
          rewardDescription: editData.reward_description || '',
          enableTrigger: editData.enable_trigger || false,
          triggerType: editData.trigger_type || '',
          triggerThreshold: editData.trigger_threshold
            ? editData.trigger_threshold.toString()
            : '',
          startDate: editData.start_date
            ? new Date(editData.start_date).toISOString().slice(0, 16)
            : '',
          endDate: editData.end_date
            ? new Date(editData.end_date).toISOString().slice(0, 16)
            : '',
          totalLimit: editData.total_limit
            ? editData.total_limit.toString()
            : '',
        })
        setImagePreview(editData.image || null)
      } else {
        resetForm()
      }
    }
  }, [open, editData])

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
      category: '',
      productLink: '',
      imageUrl: '',
      originalPrice: '',
      price: '',
      discountPercentage: '',
      latitude: '',
      longitude: '',
      locationName: '',
      alertRadius: '500',
      rewardType: '',
      rewardValue: '',
      rewardDescription: '',
      enableTrigger: false,
      triggerType: '',
      triggerThreshold: '',
      startDate: '',
      endDate: '',
      totalLimit: '',
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
      let finalImageUrl = formData.imageUrl || null
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
        finalImageUrl = publicUrlData.publicUrl
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        link: formData.productLink || null,
        image: finalImageUrl,
        company_id: companyId,
        status: 'active',
        environment: 'production',

        original_price: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        price: formData.price ? parseFloat(formData.price) : null,
        discount_percentage: formData.discountPercentage
          ? parseFloat(formData.discountPercentage)
          : null,

        reward_value: formData.rewardValue
          ? parseFloat(formData.rewardValue)
          : null,

        trigger_threshold:
          formData.enableTrigger && formData.triggerThreshold
            ? parseFloat(formData.triggerThreshold)
            : null,

        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
      } as any

      if (editData) {
        const { error } = await supabase
          .from('ad_campaigns')
          .update(payload)
          .eq('id', editData.id)
        if (error) throw error
        toast.success('Campanha atualizada com sucesso!')
      } else {
        const { error } = await supabase.from('ad_campaigns').insert(payload)
        if (error) throw error
        toast.success('Campanha criada com sucesso!')
      }
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
    price: formData.price ? parseFloat(formData.price) : undefined,
    originalPrice: formData.originalPrice
      ? parseFloat(formData.originalPrice)
      : undefined,
    discount: formData.discountPercentage
      ? `${formData.discountPercentage}% OFF`
      : undefined,
    imageUrl:
      imagePreview ||
      formData.imageUrl ||
      'https://img.usecurling.com/p/400/300?q=shopping',
    currency: 'BRL',
    status: 'published',
    region: 'BR',
    productLink: formData.productLink || '#',
    isVerified: true,
    usageCount: 0,
    promotionModel: 'standard',
  } as DiscoveredPromotion

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <DialogTitle className="text-xl text-slate-800">
            {editData ? 'Editar Campanha' : 'Criar Nova Campanha (Avançado)'}
          </DialogTitle>
          <DialogDescription>
            Configure todas as regras de geolocalização, preços, limites e
            gatilhos da sua campanha.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-white">
            <form id="campaign-form" onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="pricing">Preços & Regras</TabsTrigger>
                  <TabsTrigger value="geo">Geolocalização</TabsTrigger>
                  <TabsTrigger value="rewards">
                    Gatilhos & Recompensa
                  </TabsTrigger>
                </TabsList>

                {/* BÁSICO */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Campanha *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Mega Oferta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Descreva a oferta..."
                      className="h-24"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Selecione..." />
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
                      <Label htmlFor="productLink">
                        Link do Produto (Opcional)
                      </Label>
                      <Input
                        id="productLink"
                        name="productLink"
                        value={formData.productLink}
                        onChange={handleChange}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Imagem da Campanha</Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0 relative group">
                        {imagePreview || formData.imageUrl ? (
                          <img
                            src={imagePreview || formData.imageUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageOff className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3 w-full">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="cursor-pointer bg-white"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 shrink-0">
                            OU URL:
                          </span>
                          <Input
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="text-sm h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* PREÇOS E REGRAS */}
                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Preço Original (R$)</Label>
                      <Input
                        name="originalPrice"
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço Atual (R$)</Label>
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Desconto (%)</Label>
                      <Input
                        name="discountPercentage"
                        type="number"
                        step="0.01"
                        value={formData.discountPercentage}
                        onChange={handleChange}
                        placeholder="Ex: 20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Início da Validade</Label>
                      <Input
                        name="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim da Validade</Label>
                      <Input
                        name="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite Total de Usos</Label>
                      <Input
                        name="totalLimit"
                        type="number"
                        value={formData.totalLimit}
                        onChange={handleChange}
                        placeholder="Ilimitado"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* GEOLOCALIZAÇÃO */}
                <TabsContent value="geo" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Local</Label>
                    <Input
                      name="locationName"
                      value={formData.locationName}
                      onChange={handleChange}
                      placeholder="Ex: Shopping Centro"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        name="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="-23.5505"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        name="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="-46.6333"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Raio de Alerta (Metros)</Label>
                    <Input
                      name="alertRadius"
                      type="number"
                      value={formData.alertRadius}
                      onChange={handleChange}
                      placeholder="500"
                    />
                    <p className="text-xs text-slate-500">
                      Notificará usuários que passarem dentro deste raio.
                    </p>
                  </div>
                </TabsContent>

                {/* GATILHOS & RECOMPENSAS */}
                <TabsContent value="rewards" className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                    <div className="space-y-0.5">
                      <Label>Ativar Gatilho de Recompensa</Label>
                      <p className="text-xs text-slate-500">
                        Oferece prêmios automáticos após N ações.
                      </p>
                    </div>
                    <Switch
                      checked={formData.enableTrigger}
                      onCheckedChange={(c) =>
                        setFormData((p) => ({ ...p, enableTrigger: c }))
                      }
                    />
                  </div>

                  {formData.enableTrigger && (
                    <div className="space-y-4 animate-fade-in border p-4 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo de Gatilho</Label>
                          <Select
                            value={formData.triggerType}
                            onValueChange={(v) =>
                              setFormData((p) => ({ ...p, triggerType: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checkin">
                                Check-in na loja
                              </SelectItem>
                              <SelectItem value="purchase">
                                Compras realizadas
                              </SelectItem>
                              <SelectItem value="share">
                                Compartilhamentos
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantidade Limite (Threshold)</Label>
                          <Input
                            name="triggerThreshold"
                            type="number"
                            value={formData.triggerThreshold}
                            onChange={handleChange}
                            placeholder="Ex: 5"
                          />
                        </div>
                      </div>
                      <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo de Recompensa</Label>
                          <Select
                            value={formData.rewardType}
                            onValueChange={(v) =>
                              setFormData((p) => ({ ...p, rewardType: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard Discount">
                                Desconto Padrão
                              </SelectItem>
                              <SelectItem value="Store Credit">
                                Crédito na Loja
                              </SelectItem>
                              <SelectItem value="Free Item">
                                Item Gratuito
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Valor da Recompensa</Label>
                          <Input
                            name="rewardValue"
                            type="number"
                            step="0.01"
                            value={formData.rewardValue}
                            onChange={handleChange}
                            placeholder="Ex: 50.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição da Recompensa</Label>
                        <Input
                          name="rewardDescription"
                          value={formData.rewardDescription}
                          onChange={handleChange}
                          placeholder="Ex: Ganhe 50% na próxima compra"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </form>
          </div>

          <div className="w-full md:w-[320px] bg-slate-100/50 border-t md:border-t-0 md:border-l p-6 flex flex-col items-center shrink-0">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider w-full text-center">
              Preview
            </h3>
            <div className="w-full pointer-events-none sticky top-6">
              <PromotionCard promotion={previewData} />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0">
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
