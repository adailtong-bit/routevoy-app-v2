import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, UploadCloud, ImageIcon } from 'lucide-react'
import { CampaignPreview } from '@/components/merchant/CampaignPreview'

export function CampaignFormDialog({
  open,
  onOpenChange,
  franchiseId,
  companyId,
  affiliateId,
  onSuccess,
  editData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  franchiseId?: string
  companyId?: string
  affiliateId?: string
  onSuccess: () => void
  editData?: any
}) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Geral',
    status: 'active',
    image: '',
    link: '',
    start_date: '',
    end_date: '',
    promotion_model: 'standard',
    discount_percentage: 0,
    original_price: 0,
    price: 0,
    is_demo: false,
    country: 'BR',
    limit_type: 'unlimited',
    total_limit: 0,
    enable_proximity_alerts: false,
    location_name: '',
    latitude: '',
    longitude: '',
    alert_radius: 5,
    enable_trigger: false,
    trigger_type: 'visits',
    trigger_threshold: 0,
    reward_description: '',
    reward_value: 0,
  })

  useEffect(() => {
    if (
      formData.promotion_model === 'fixed_discount' &&
      formData.original_price &&
      formData.price
    ) {
      const original = Number(formData.original_price)
      const current = Number(formData.price)
      if (original > 0 && current >= 0 && current < original) {
        const discount = Math.round(((original - current) / original) * 100)
        if (discount !== formData.discount_percentage) {
          setFormData((prev) => ({ ...prev, discount_percentage: discount }))
        }
      }
    }
  }, [formData.original_price, formData.price, formData.promotion_model])

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          title: editData.title || '',
          description: editData.description || '',
          category: editData.category || 'Geral',
          status: editData.status || 'active',
          image: editData.image || '',
          link: editData.link || '',
          start_date: editData.start_date
            ? new Date(editData.start_date).toISOString().split('T')[0]
            : '',
          end_date: editData.end_date
            ? new Date(editData.end_date).toISOString().split('T')[0]
            : '',
          promotion_model:
            editData.promotion_model === 'discount'
              ? 'fixed_discount'
              : editData.promotion_model || 'standard',
          discount_percentage: editData.discount_percentage || 0,
          original_price: editData.original_price || 0,
          price: editData.price || 0,
          is_demo: !!editData.is_demo,
          country: editData.country || 'BR',
          limit_type: editData.limit_type || 'unlimited',
          total_limit: editData.total_limit || 0,
          enable_proximity_alerts: !!editData.enable_proximity_alerts,
          location_name: editData.location_name || '',
          latitude: editData.latitude ? String(editData.latitude) : '',
          longitude: editData.longitude ? String(editData.longitude) : '',
          alert_radius: editData.alert_radius || 5,
          enable_trigger: !!editData.enable_trigger,
          trigger_type: editData.trigger_type || 'visits',
          trigger_threshold: editData.trigger_threshold || 0,
          reward_description: editData.reward_description || '',
          reward_value: editData.reward_value || 0,
        })
      } else {
        setFormData({
          title: '',
          description: '',
          category: 'Geral',
          status: 'active',
          image: '',
          link: '',
          start_date: '',
          end_date: '',
          promotion_model: 'standard',
          discount_percentage: 0,
          original_price: 0,
          price: 0,
          is_demo: false,
          country: 'BR',
          limit_type: 'unlimited',
          total_limit: 0,
          enable_proximity_alerts: false,
          location_name: '',
          latitude: '',
          longitude: '',
          alert_radius: 5,
          enable_trigger: false,
          trigger_type: 'visits',
          trigger_threshold: 0,
          reward_description: '',
          reward_value: 0,
        })
      }
    }
  }, [open, editData])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('O tamanho da imagem deve ser menor que 5MB')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('promotions')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('promotions')
        .getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, image: urlData.publicUrl }))
      toast.success('Imagem enviada com sucesso!')
    } catch (err: any) {
      console.error('Error uploading image:', err)
      toast.error(
        err.message ||
          'Falha ao enviar imagem. Verifique se o bucket "promotions" existe.',
      )
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error('O título é obrigatório')
      return
    }

    if (formData.promotion_model === 'buy_and_get') {
      if (!formData.reward_value || !formData.reward_description) {
        toast.error(
          'O valor e a descrição da recompensa são obrigatórios para o modelo de Compra',
        )
        return
      }
    }

    if (
      formData.promotion_model === 'fixed_discount' ||
      formData.promotion_model === 'discount' ||
      formData.promotion_model === 'standard'
    ) {
      if (!formData.discount_percentage) {
        toast.error('O percentual de desconto é obrigatório')
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        image: formData.image,
        link: formData.link,
        promotion_model: formData.promotion_model,
        discount_percentage:
          formData.promotion_model === 'fixed_discount' ||
          formData.promotion_model === 'discount' ||
          formData.promotion_model === 'standard'
            ? formData.discount_percentage !== '' &&
              formData.discount_percentage !== null
              ? Number(formData.discount_percentage)
              : null
            : null,
        environment: 'production',
        environment: 'production',
        discount_percentage:
          formData.promotion_model === 'standard'
            ? Number(formData.discount_percentage) || null
            : formData.promotion_model === 'fixed_discount'
              ? Number(formData.original_price) &&
                Number(formData.price) &&
                Number(formData.original_price) > Number(formData.price)
                ? Math.round(
                    ((Number(formData.original_price) -
                      Number(formData.price)) /
                      Number(formData.original_price)) *
                      100,
                  )
                : null
              : null,
        original_price:
          formData.promotion_model === 'fixed_discount'
            ? formData.original_price !== '' && formData.original_price !== null
              ? Number(formData.original_price)
              : null
            : null,
        price:
          formData.promotion_model === 'fixed_discount'
            ? formData.price !== '' && formData.price !== null
              ? Number(formData.price)
              : null
            : null,
        is_demo: formData.is_demo,
        country: formData.country,
        limit_type: formData.limit_type,
        total_limit: Number(formData.total_limit) || null,
        enable_proximity_alerts: formData.enable_proximity_alerts,
        location_name: formData.location_name,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        alert_radius: Number(formData.alert_radius) || null,
        enable_trigger: formData.enable_trigger,
        trigger_type: formData.trigger_type,
        trigger_threshold: Number(formData.trigger_threshold) || null,
        reward_description:
          formData.promotion_model === 'buy_and_get' || formData.enable_trigger
            ? formData.reward_description
            : null,
        reward_value:
          formData.promotion_model === 'buy_and_get' || formData.enable_trigger
            ? Number(formData.reward_value) || null
            : null,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        affiliate_id: affiliateId || null,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
      }

      if (editData?.id) {
        const { error } = await supabase
          .from('ad_campaigns')
          .update(payload)
          .eq('id', editData.id)
        if (error) throw error
        toast.success('Campanha atualizada com sucesso!')
      } else {
        const { error } = await supabase.from('ad_campaigns').insert([payload])
        if (error) throw error
        toast.success('Campanha criada com sucesso!')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error('Error saving campaign:', err)
      toast.error(err.message || 'Falha ao salvar campanha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {editData ? 'Edit Campaign' : 'Create New Campaign'}
          </DialogTitle>
          <DialogDescription>
            Configure all geolocation rules, pricing, limits, and triggers for
            your campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto p-6">
            <form
              id="campaign-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing & Rules</TabsTrigger>
                  <TabsTrigger value="geolocation">Geolocation</TabsTrigger>
                  <TabsTrigger value="triggers">Triggers & Rewards</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Campaign Image / Banner</Label>
                    <div className="flex items-center gap-4">
                      {formData.image ? (
                        <div className="relative w-32 h-20 rounded-md overflow-hidden border shrink-0">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, image: '' }))
                            }
                          >
                            X
                          </Button>
                        </div>
                      ) : (
                        <div className="w-32 h-20 bg-slate-100 rounded-md border-2 border-dashed flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Label
                          htmlFor="image-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-slate-50 transition-colors"
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UploadCloud className="w-4 h-4" />
                          )}
                          Select Image
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Supported formats: JPG, PNG. Max size: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      placeholder="Ex: Summer Offer"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Campaign details..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(val) =>
                          setFormData({ ...formData, category: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Geral">General</SelectItem>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(val) =>
                          setFormData({ ...formData, status: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="ended">Ended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>External Link</Label>
                    <Input
                      placeholder="https://"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Promotion Model</Label>
                    <Select
                      value={formData.promotion_model}
                      onValueChange={(val) =>
                        setFormData({ ...formData, promotion_model: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="fixed_discount">
                          Fixed Discount
                        </SelectItem>
                        <SelectItem value="buy_and_get">Buy Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.promotion_model === 'fixed_discount' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Original Price</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={formData.original_price || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              original_price: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Price / Value</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={formData.price || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {(formData.promotion_model === 'fixed_discount' ||
                    formData.promotion_model === 'discount' ||
                    formData.promotion_model === 'standard') && (
                    <div className="space-y-2">
                      <Label>Discount (%) *</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 20"
                        value={formData.discount_percentage || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_percentage: Number(e.target.value),
                          })
                        }
                        required={
                          formData.promotion_model === 'fixed_discount' ||
                          formData.promotion_model === 'discount' ||
                          formData.promotion_model === 'standard'
                        }
                      />
                    </div>
                  )}

                  {formData.promotion_model === 'buy_and_get' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Value *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={formData.reward_value || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reward_value: Number(e.target.value),
                            })
                          }
                          required={formData.promotion_model === 'buy_and_get'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description/Text *</Label>
                        <Textarea
                          placeholder="Ex: Get a free coffee after 5 visits"
                          value={formData.reward_description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reward_description: e.target.value,
                            })
                          }
                          required={formData.promotion_model === 'buy_and_get'}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Limit Type</Label>
                      <Select
                        value={formData.limit_type}
                        onValueChange={(val) =>
                          setFormData({ ...formData, limit_type: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                          <SelectItem value="total_redemptions">
                            Total Redemptions
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Usage Limit</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 100"
                        value={formData.total_limit || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            total_limit: Number(e.target.value),
                          })
                        }
                        disabled={formData.limit_type === 'unlimited'}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="geolocation" className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <Label>Enable Proximity Alerts</Label>
                      <p className="text-sm text-slate-500">
                        Notify users when they are near this location.
                      </p>
                    </div>
                    <Switch
                      checked={formData.enable_proximity_alerts}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          enable_proximity_alerts: checked,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input
                      placeholder="Ex: Main Store"
                      value={formData.location_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location_name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="text"
                        placeholder="-23.5505"
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData({ ...formData, latitude: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="text"
                        placeholder="-46.6333"
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Alert Radius (km)</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={formData.alert_radius || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alert_radius: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="triggers" className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <Label>Enable Triggers</Label>
                      <p className="text-sm text-slate-500">
                        Create gamified triggers for users.
                      </p>
                    </div>
                    <Switch
                      checked={formData.enable_trigger}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, enable_trigger: checked })
                      }
                    />
                  </div>

                  {formData.enable_trigger && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Trigger Type</Label>
                          <Select
                            value={formData.trigger_type}
                            onValueChange={(val) =>
                              setFormData({ ...formData, trigger_type: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="visits">Visits</SelectItem>
                              <SelectItem value="purchases">
                                Purchases
                              </SelectItem>
                              <SelectItem value="referrals">
                                Referrals
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Threshold</Label>
                          <Input
                            type="number"
                            placeholder="Ex: 5"
                            value={formData.trigger_threshold || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                trigger_threshold: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      {formData.promotion_model !== 'buy_and_get' && (
                        <>
                          <div className="space-y-2">
                            <Label>Reward Value</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={formData.reward_value || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  reward_value: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Reward Description</Label>
                            <Textarea
                              placeholder="Ex: Get a free coffee after 5 visits"
                              value={formData.reward_description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  reward_description: e.target.value,
                                })
                              }
                              rows={2}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </form>
          </div>

          <div className="w-[360px] bg-slate-50 border-l p-6 flex flex-col items-center shrink-0 overflow-y-auto">
            <h3 className="font-bold text-slate-700 mb-4 tracking-wide text-sm">
              PREVIEW
            </h3>
            <div className="w-full max-w-[320px] flex justify-center">
              <CampaignPreview
                title={formData.title}
                description={formData.description}
                image={
                  formData.image ||
                  'https://img.usecurling.com/p/400/300?q=shopping'
                }
                startDate={formData.start_date}
                endDate={formData.end_date}
                discountPercentage={formData.discount_percentage}
                originalPrice={formData.original_price}
                price={formData.price}
                promotionModel={formData.promotion_model}
                rewardDescription={formData.reward_description}
                minimumPurchase={formData.reward_value}
                currency="BRL"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50/50">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="campaign-form"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
