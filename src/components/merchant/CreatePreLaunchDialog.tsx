import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ImageOff, Rocket } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function CreatePreLaunchDialog({
  companyId,
  onCreated,
}: {
  companyId: string
  onCreated: () => void
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_link: '',
    category: '',
    is_seasonal: false,
    engagement_threshold: '',
    reward_type: '',
    reward_value: '',
    reward_description: '',
    latitude: '',
    longitude: '',
    alert_radius: '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .then(({ data }) => {
          if (data) setCategories(data)
        })
    }
  }, [open])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const isFreeItem = formData.reward_type === 'Free Item'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let image_url = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('promotions')
          .upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data } = supabase.storage
          .from('promotions')
          .getPublicUrl(fileName)
        image_url = data.publicUrl
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        product_link: formData.product_link,
        category: formData.category,
        is_seasonal: formData.is_seasonal,
        engagement_threshold:
          parseInt(formData.engagement_threshold, 10) || null,
        reward_type: formData.reward_type,
        reward_value: isFreeItem
          ? null
          : parseFloat(formData.reward_value) || null,
        reward_description: isFreeItem ? formData.reward_description : null,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        alert_radius: parseFloat(formData.alert_radius) || null,
        image_url,
        promotion_model: 'pre-launch',
        company_id: companyId,
        status: 'active',
        environment: 'production',
        unique_hash: `prelaunch_${Date.now()}_${companyId}`,
      }

      const { error } = await supabase
        .from('discovered_promotions')
        .insert(payload)
      if (error) throw error

      toast.success(t('common.success', 'Pre-launch campaign created!'))
      setOpen(false)
      onCreated()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Rocket className="w-4 h-4" />
          {t('merchant.pre_launch.create_btn', 'Create Pre-launch')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('merchant.pre_launch.create_btn', 'Create Pre-launch')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('common.title', 'Title')}</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.category', 'Category')}</Label>
              <Select
                required
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'common.select_category',
                      'Select a category',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {t(`category.${cat.name}`, cat.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('common.description', 'Description')}</Label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t('merchant.pre_launch.url', 'Product/Source URL')}</Label>
            <Input
              required
              type="url"
              value={formData.product_link}
              onChange={(e) =>
                setFormData({ ...formData, product_link: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div className="space-y-2">
              <Label>
                {t('merchant.pre_launch.sharing_goal', 'Sharing Goal')}
              </Label>
              <Input
                required
                type="number"
                min="1"
                value={formData.engagement_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    engagement_threshold: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('merchant.pre_launch.reward_to_grant', 'Reward to Grant')}
              </Label>
              <Select
                required
                value={formData.reward_type}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    reward_type: v,
                    reward_value: '',
                    reward_description: '',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'common.select',
                      'Select or describe the reward...',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Store Credit">
                    {t('merchant.pre_launch.store_credit', 'Store Credit')}
                  </SelectItem>
                  <SelectItem value="Compound Discount">
                    {t(
                      'merchant.pre_launch.compound_discount',
                      'Compound Discount',
                    )}
                  </SelectItem>
                  <SelectItem value="Standard Discount">
                    {t(
                      'merchant.pre_launch.standard_discount',
                      'Standard Discount',
                    )}
                  </SelectItem>
                  <SelectItem value="Free Item">
                    {t('merchant.pre_launch.free_item', 'Free Item')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isFreeItem ? (
              <div className="space-y-2">
                <Label>
                  {t(
                    'merchant.pre_launch.reward_desc_text',
                    'Reward Description (Text)',
                  )}
                </Label>
                <Input
                  required
                  type="text"
                  placeholder="Ex: 1 Chocolate Milkshake 300ml"
                  value={formData.reward_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reward_description: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>
                  {t('merchant.pre_launch.reward_value', 'Reward Value')}
                </Label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 20"
                  value={formData.reward_value}
                  onChange={(e) =>
                    setFormData({ ...formData, reward_value: e.target.value })
                  }
                />
              </div>
            )}
            <div className="space-y-2 flex items-center pt-8">
              <Checkbox
                id="seasonal"
                checked={formData.is_seasonal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_seasonal: !!checked })
                }
              />
              <Label htmlFor="seasonal" className="ml-2 font-medium">
                {t(
                  'merchant.pre_launch.mark_seasonal',
                  'Mark as Seasonal Offer',
                )}
              </Label>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm transition-all duration-300">
            <h4 className="font-bold text-emerald-800 text-sm mb-1">
              {t('merchant.pre_launch.rule_summary', 'Rule Summary')}
            </h4>
            <div className="flex items-start gap-2">
              <Rocket className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-emerald-700 text-sm leading-relaxed">
                {t(
                  'merchant.pre_launch.rule_desc_part1',
                  'If the customer reaches',
                )}{' '}
                <strong className="font-bold px-1 bg-emerald-100 rounded text-emerald-900">
                  {formData.engagement_threshold || '[X]'}{' '}
                  {t('merchant.pre_launch.shares', 'shares')}
                </strong>
                , {t('merchant.pre_launch.rule_desc_part2', 'they will earn:')}{' '}
                <strong className="font-bold px-1 bg-emerald-100 rounded text-emerald-900">
                  {isFreeItem
                    ? formData.reward_description || '[Reward Description]'
                    : formData.reward_value
                      ? formData.reward_type === 'Store Credit'
                        ? `$${formData.reward_value}`
                        : `${formData.reward_value}%`
                      : '[Reward Value]'}
                </strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-xl">
            <div className="col-span-full">
              <Label className="text-sm font-bold text-slate-700">
                {t(
                  'merchant.pre_launch.geofencing',
                  'Geographic Boosting (Geofencing)',
                )}
              </Label>
            </div>
            <div className="space-y-2">
              <Label>{t('merchant.pre_launch.latitude', 'Latitude')}</Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('merchant.pre_launch.longitude', 'Longitude')}</Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('merchant.pre_launch.alert_radius', 'Alert Radius (meters)')}
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.alert_radius}
                onChange={(e) =>
                  setFormData({ ...formData, alert_radius: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t('merchant.pre_launch.campaign_image', 'Campaign Image')}
            </Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded border-2 border-dashed flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="mr-2"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading
                ? t('common.loading', 'Creating...')
                : t('merchant.pre_launch.launch_btn', 'Launch Campaign')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
