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
import { CampaignPreview } from '@/components/merchant/CampaignPreview'
import { ImageOff } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  franchiseId,
  onSuccess,
  editData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId?: string
  franchiseId?: string
  onSuccess: () => void
  editData?: any
}) {
  const { t } = useLanguage()
  const auth = useAuth()
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
    promotionModel: 'standard',
    rewardDescription: '',
    minimumPurchase: '',
    latitude: '',
    longitude: '',
    locationName: '',
    alertRadius: '500',
    rewardType: '',
    rewardValue: '',
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
        const model =
          editData.promotion_model === 'buy_and_win'
            ? 'buy_and_get'
            : editData.promotion_model || 'standard'

        setFormData({
          title: editData.title || '',
          description: editData.description || '',
          category: editData.category || '',
          productLink: editData.link || '',
          imageUrl: editData.image || '',
          promotionModel: model,
          rewardDescription: editData.reward_description || '',
          minimumPurchase:
            model === 'buy_and_get'
              ? editData.trigger_threshold
                ? editData.trigger_threshold.toString()
                : ''
              : '',
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
          enableTrigger: editData.enable_trigger || false,
          triggerType: editData.trigger_type || '',
          triggerThreshold:
            model !== 'buy_and_get'
              ? editData.trigger_threshold
                ? editData.trigger_threshold.toString()
                : ''
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
      promotionModel: 'standard',
      rewardDescription: '',
      minimumPurchase: '',
      latitude: '',
      longitude: '',
      locationName: '',
      alertRadius: '500',
      rewardType: '',
      rewardValue: '',
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
      return toast.error(
        t(
          'campaign_form.messages.req_fields',
          'Título e Categoria são obrigatórios',
        ),
      )
    }

    if (formData.promotionModel === 'buy_and_get') {
      if (!formData.rewardDescription) {
        return toast.error(
          t(
            'campaign_form.messages.req_reward',
            'Descrição da recompensa é obrigatória para este modelo',
          ),
        )
      }
      if (!formData.minimumPurchase) {
        return toast.error(
          t(
            'campaign_form.messages.req_min_purchase',
            'Valor mínimo de compra é obrigatório para este modelo',
          ),
        )
      }
    }

    if (
      formData.promotionModel === 'fixed_discount' &&
      !formData.discountPercentage
    ) {
      return toast.error(
        t(
          'campaign_form.messages.req_discount',
          'Porcentagem de desconto é obrigatória para este modelo',
        ),
      )
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
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        status: editData ? editData.status : 'active',
        environment: 'production',
        promotion_model: formData.promotionModel,

        reward_description:
          formData.promotionModel === 'buy_and_get'
            ? formData.rewardDescription
            : null,
        original_price:
          formData.promotionModel === 'standard' && formData.originalPrice
            ? parseFloat(formData.originalPrice)
            : null,
        price:
          formData.promotionModel === 'standard' && formData.price
            ? parseFloat(formData.price)
            : null,
        discount_percentage:
          (formData.promotionModel === 'standard' ||
            formData.promotionModel === 'fixed_discount') &&
          formData.discountPercentage
            ? parseFloat(formData.discountPercentage)
            : null,
        reward_value: formData.rewardValue
          ? parseFloat(formData.rewardValue)
          : null,

        trigger_threshold:
          formData.promotionModel === 'buy_and_get'
            ? formData.minimumPurchase
              ? parseFloat(formData.minimumPurchase)
              : null
            : formData.enableTrigger && formData.triggerThreshold
              ? parseFloat(formData.triggerThreshold)
              : null,

        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        total_limit: formData.totalLimit
          ? parseInt(formData.totalLimit, 10)
          : null,

        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        location_name: formData.locationName || null,
        alert_radius: formData.alertRadius
          ? parseInt(formData.alertRadius, 10)
          : null,

        enable_trigger: formData.enableTrigger,
        trigger_type: formData.triggerType || null,
      } as any

      if (editData) {
        const { error } = await supabase
          .from('ad_campaigns')
          .update(payload)
          .eq('id', editData.id)
        if (error) throw error
        toast.success(
          t(
            'campaign_form.messages.success_update',
            'Campanha atualizada com sucesso!',
          ),
        )
      } else {
        const { error } = await supabase.from('ad_campaigns').insert(payload)
        if (error) throw error
        toast.success(
          t(
            'campaign_form.messages.success_create',
            'Campanha criada com sucesso!',
          ),
        )
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(
        error.message ||
          t('campaign_form.messages.error_save', 'Erro ao salvar a campanha'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <DialogTitle className="text-xl text-slate-800">
            {editData
              ? t('campaign_form.edit_title', 'Editar Campanha')
              : t('campaign_form.create_title', 'Criar Nova Campanha')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'campaign_form.description',
              'Configure todas as regras de geolocalização, preços, limites e gatilhos para sua campanha.',
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-white">
            <form id="campaign-form" onSubmit={handleSubmit}>
              <Tabs defaultValue="pricing" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6 h-auto min-h-10">
                  <TabsTrigger
                    value="basic"
                    className="whitespace-normal text-xs sm:text-sm"
                  >
                    {t('campaign_form.tabs.basic', 'Básico')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="pricing"
                    className="whitespace-normal text-xs sm:text-sm"
                  >
                    {t('campaign_form.tabs.pricing', 'Preços e Regras')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="geo"
                    className="whitespace-normal text-xs sm:text-sm"
                  >
                    {t('campaign_form.tabs.geo', 'Geolocalização')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="rewards"
                    className="whitespace-normal text-xs sm:text-sm"
                  >
                    {t('campaign_form.tabs.rewards', 'Gatilhos e Recompensas')}
                  </TabsTrigger>
                </TabsList>

                {/* BASIC */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      {t('campaign_form.fields.title', 'Título da Campanha *')}
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder={t(
                        'campaign_form.fields.title_ph',
                        'Ex: Mega Promoção',
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t('campaign_form.fields.desc', 'Descrição')}
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={t(
                        'campaign_form.fields.desc_ph',
                        'Descreva a oferta...',
                      )}
                      className="h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        {t('campaign_form.fields.category', 'Categoria *')}
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, category: v }))
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('common.select', 'Selecione...')}
                          />
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
                        {t(
                          'campaign_form.fields.product_link',
                          'Link do Produto (Opcional)',
                        )}
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
                    <Label>
                      {t('campaign_form.fields.image', 'Imagem da Campanha')}
                    </Label>
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
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer bg-white"
                          />
                          <p className="text-xs text-slate-500 mt-1.5">
                            {t(
                              'campaign_form.fields.image_specs',
                              'Tamanho ideal: 1200x630px. Tamanho máximo do arquivo: 5MB.',
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 shrink-0">
                            {t('campaign_form.fields.image_or', 'OU URL:')}
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

                {/* PRICING & RULES */}
                <TabsContent value="pricing" className="space-y-4">
                  <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <Label>
                      {t(
                        'campaign_form.fields.promotion_model',
                        'Modelo de Promoção',
                      )}
                    </Label>
                    <Select
                      value={formData.promotionModel}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, promotionModel: v }))
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          {t(
                            'campaign_form.fields.model_standard',
                            'Padrão / Voucher',
                          )}
                        </SelectItem>
                        <SelectItem value="fixed_discount">
                          {t(
                            'campaign_form.fields.model_fixed',
                            'Desconto Fixo',
                          )}
                        </SelectItem>
                        <SelectItem value="buy_and_get">
                          {t(
                            'campaign_form.fields.model_buy_get',
                            'Compre e Ganhe',
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.promotionModel === 'standard' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>
                          {t(
                            'campaign_form.fields.original_price',
                            'Preço Original',
                          )}
                        </Label>
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
                        <Label>
                          {t(
                            'campaign_form.fields.price',
                            'Preço / Valor Atual',
                          )}
                        </Label>
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
                        <Label>
                          {t(
                            'campaign_form.fields.discount_pct',
                            'Desconto (%)',
                          )}
                        </Label>
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
                  )}

                  {formData.promotionModel === 'fixed_discount' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>
                          {t(
                            'campaign_form.fields.discount_pct',
                            'Desconto (%)',
                          )}
                        </Label>
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
                  )}

                  {formData.promotionModel === 'buy_and_get' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          {t(
                            'campaign_form.fields.min_purchase',
                            'Valor Mínimo de Compra',
                          )}
                        </Label>
                        <Input
                          name="minimumPurchase"
                          type="number"
                          step="0.01"
                          value={formData.minimumPurchase}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t(
                            'campaign_form.fields.reward_desc',
                            'Descrição da Recompensa (Texto) *',
                          )}
                        </Label>
                        <Input
                          name="rewardDescription"
                          value={formData.rewardDescription}
                          onChange={handleChange}
                          placeholder={t(
                            'campaign_form.fields.reward_desc_ph',
                            'Ex: Ganhe uma sobremesa grátis',
                          )}
                          required={formData.promotionModel === 'buy_and_get'}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>
                        {t('campaign_form.fields.start_date', 'Data de Início')}
                      </Label>
                      <Input
                        name="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t('campaign_form.fields.end_date', 'Data de Término')}
                      </Label>
                      <Input
                        name="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t(
                          'campaign_form.fields.total_limit',
                          'Limite Total de Uso',
                        )}
                      </Label>
                      <Input
                        name="totalLimit"
                        type="number"
                        value={formData.totalLimit}
                        onChange={handleChange}
                        placeholder={t(
                          'campaign_form.fields.unlimited',
                          'Ilimitado',
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* GEOLOCATION */}
                <TabsContent value="geo" className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {t('campaign_form.fields.location_name', 'Nome do Local')}
                    </Label>
                    <Input
                      name="locationName"
                      value={formData.locationName}
                      onChange={handleChange}
                      placeholder={t(
                        'campaign_form.fields.location_ph',
                        'Ex: Shopping Mall',
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {t('campaign_form.fields.latitude', 'Latitude')}
                      </Label>
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
                      <Label>
                        {t('campaign_form.fields.longitude', 'Longitude')}
                      </Label>
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
                    <Label>
                      {t(
                        'campaign_form.fields.alert_radius',
                        'Raio de Alerta (Metros)',
                      )}
                    </Label>
                    <Input
                      name="alertRadius"
                      type="number"
                      value={formData.alertRadius}
                      onChange={handleChange}
                      placeholder="500"
                    />
                    <p className="text-xs text-slate-500">
                      {t(
                        'campaign_form.fields.alert_radius_help',
                        'Notificará os usuários que passarem dentro deste raio.',
                      )}
                    </p>
                  </div>
                </TabsContent>

                {/* TRIGGERS & REWARDS */}
                <TabsContent value="rewards" className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                    <div className="space-y-0.5">
                      <Label>
                        {t(
                          'campaign_form.fields.enable_trigger',
                          'Ativar Gatilho de Recompensa',
                        )}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t(
                          'campaign_form.fields.trigger_help',
                          'Oferece prêmios automáticos após N ações.',
                        )}
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
                          <Label>
                            {t(
                              'campaign_form.fields.trigger_type',
                              'Tipo de Gatilho',
                            )}
                          </Label>
                          <Select
                            value={formData.triggerType}
                            onValueChange={(v) =>
                              setFormData((p) => ({ ...p, triggerType: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('common.select', 'Selecione...')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checkin">
                                {t('triggers.check_in', 'Check-in na Loja')}
                              </SelectItem>
                              <SelectItem value="purchase">
                                {t('triggers.purchase', 'Compras Realizadas')}
                              </SelectItem>
                              <SelectItem value="share">
                                {t('triggers.share', 'Compartilhamentos')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>
                            {t(
                              'campaign_form.fields.trigger_threshold',
                              'Quantidade Limite (Threshold)',
                            )}
                          </Label>
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
                          <Label>
                            {t(
                              'campaign_form.fields.reward_type',
                              'Tipo de Recompensa',
                            )}
                          </Label>
                          <Select
                            value={formData.rewardType}
                            onValueChange={(v) =>
                              setFormData((p) => ({ ...p, rewardType: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('common.select', 'Selecione...')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard Discount">
                                {t(
                                  'rewards.standard_discount',
                                  'Desconto Padrão',
                                )}
                              </SelectItem>
                              <SelectItem value="Store Credit">
                                {t('rewards.store_credit', 'Crédito na Loja')}
                              </SelectItem>
                              <SelectItem value="Free Item">
                                {t('rewards.free_item', 'Item Grátis')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>
                            {t(
                              'campaign_form.fields.reward_value',
                              'Valor da Recompensa',
                            )}
                          </Label>
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
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </form>
          </div>

          <div className="w-full md:w-[360px] bg-slate-100/50 border-t md:border-t-0 md:border-l p-6 flex flex-col shrink-0 overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider w-full text-center shrink-0">
              {t('common.preview', 'Pré-visualização')}
            </h3>
            <div className="w-full flex justify-center pb-6">
              <CampaignPreview
                title={formData.title}
                description={formData.description}
                image={
                  imagePreview ||
                  formData.imageUrl ||
                  'https://img.usecurling.com/p/400/300?q=shopping'
                }
                startDate={formData.startDate}
                endDate={formData.endDate}
                companyUrl={formData.productLink}
                discountPercentage={formData.discountPercentage}
                originalPrice={formData.originalPrice}
                price={formData.price}
                currency={
                  (auth.profile as any)?.resolved_currency ||
                  auth.profile?.preferred_currency ||
                  'BRL'
                }
                promotionModel={formData.promotionModel}
                rewardDescription={formData.rewardDescription}
                minimumPurchase={formData.minimumPurchase}
                isOnline={!formData.latitude || !formData.longitude}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('campaign_form.buttons.cancel', 'Cancelar')}
          </Button>
          <Button type="submit" form="campaign-form" disabled={loading}>
            {loading
              ? t('campaign_form.buttons.saving', 'Salvando...')
              : t('campaign_form.buttons.save', 'Salvar Campanha')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
