import { useState, useEffect, useRef } from 'react'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { supabase } from '@/lib/supabase/client'
import {
  Plus,
  Image as ImageIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'

const PLACEMENT_OPTIONS = [
  { value: 'top_ranking', label: 'Top Ranking' },
  { value: 'lateral_highlight', label: 'Destaque Lateral' },
  { value: 'main_banner', label: 'Banner Principal' },
  { value: 'home_featured', label: 'Destaque Home' },
  { value: 'home_hero', label: 'Home Hero' },
  { value: 'global_search', label: 'Busca Global' },
  { value: 'offer_of_the_day', label: 'Oferta do Dia' },
  { value: 'sponsored_push', label: 'Push Patrocinado' },
]

const BILLING_OPTIONS = [
  { value: 'internal_boost', label: 'Impulsionamento Interno (Cupom)' },
  { value: 'internal', label: 'Impulsionamento Interno (Legado)' },
  { value: 'cpc', label: 'CPC (Custo por Clique)' },
  { value: 'cpm', label: 'CPM (Custo por Mil)' },
  { value: 'external', label: 'Publicidade Externa' },
  { value: 'fixed', label: 'Fixo (Período)' },
]

export function CreateAdCampaignDialog({
  companyId,
  environment,
  onCreated,
}: any) {
  const { t } = useLanguage()
  const { profile, role } = useAuth()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [openCombo, setOpenCombo] = useState(false)
  const [affiliatePlatforms, setAffiliatePlatforms] = useState<string[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState('')

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    category: '',
    image: '',
    link: '',
    placement: 'home_hero',
    billing_type: 'fixed',
    price: '',
    budget: '',
    cost_per_click: '',
    start_date: '',
    end_date: '',
    promotionModel: 'standard',
    description: '',
    isSeasonal: false,
    status: 'active',
    location_name: '',
    alert_radius: '',
    latitude: '',
    longitude: '',
  })

  useEffect(() => {
    if (open) {
      supabase
        .from('categories')
        .select('id, name, label')
        .eq('status', 'active')
        .order('label')
        .then(({ data }) => data && setCategories(data))

      if (role === 'affiliate' || profile?.is_affiliate) {
        supabase
          .from('affiliate_partners')
          .select('platform_ids')
          .eq('user_id', profile?.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.platform_ids) {
              setAffiliatePlatforms(Object.keys(data.platform_ids))
            }
          })
      }
    }
  }, [open, role, profile])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error(
        t(
          'common.invalid_file_type',
          'Invalid file type. Only JPG, PNG and WEBP are allowed.',
        ),
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        t('common.file_too_large', 'File size must be less than 5MB.'),
      )
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${companyId || 'general'}_${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('ad-campaigns')
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('ad-campaigns')
        .getPublicUrl(fileName)

      setForm({ ...form, image: publicUrlData.publicUrl })
      toast.success(t('common.upload_success', 'Image uploaded successfully'))
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(
        error.message || t('common.upload_error', 'Failed to upload image'),
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.category) {
      return toast.error(
        t('common.error_title_category', 'Title and Category are required'),
      )
    }

    // Affiliate Campaign Scope Locking Validation
    if (role === 'affiliate' || profile?.is_affiliate) {
      if (!selectedPlatform) {
        return toast.error(
          'Please select an approved platform for this campaign.',
        )
      }

      const hasPlatformMatch =
        form.link?.toLowerCase().includes(selectedPlatform.toLowerCase()) ||
        form.title?.toLowerCase().includes(selectedPlatform.toLowerCase())

      if (form.link && !hasPlatformMatch) {
        return toast.error(
          t(
            'affiliate.unauthorized_platform_campaign',
            'Your destination link or title must match the selected approved platform.',
          ),
        )
      }
    }

    setIsLoading(true)

    const payload = {
      company_id: companyId,
      title: form.title,
      category: form.category,
      image: form.image || null,
      link: form.link || null,
      placement: form.placement,
      billing_type: form.billing_type,
      price:
        form.price && !isNaN(parseFloat(form.price))
          ? parseFloat(form.price)
          : null,
      budget:
        form.budget && !isNaN(parseFloat(form.budget))
          ? parseFloat(form.budget)
          : null,
      cost_per_click:
        form.cost_per_click && !isNaN(parseFloat(form.cost_per_click))
          ? parseFloat(form.cost_per_click)
          : null,
      start_date: form.start_date
        ? new Date(form.start_date).toISOString()
        : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      promotion_model: form.promotionModel,
      description: form.description || null,
      is_seasonal: form.isSeasonal,
      status: form.status,
      environment: environment || 'production',
      location_name: form.location_name || null,
      alert_radius:
        form.alert_radius && !isNaN(parseFloat(form.alert_radius))
          ? parseFloat(form.alert_radius)
          : null,
      latitude:
        form.latitude && !isNaN(parseFloat(form.latitude))
          ? parseFloat(form.latitude)
          : null,
      longitude:
        form.longitude && !isNaN(parseFloat(form.longitude))
          ? parseFloat(form.longitude)
          : null,
    }

    const { error } = await supabase.from('ad_campaigns').insert(payload)

    setIsLoading(false)

    if (error) {
      console.error(error)
      return toast.error(t('ads.failed_create', 'Failed to create campaign'))
    }

    toast.success(t('ads.success_create', 'Campaign created successfully'))
    setOpen(false)
    setForm({
      title: '',
      category: '',
      image: '',
      link: '',
      placement: 'home_hero',
      billing_type: 'fixed',
      price: '',
      budget: '',
      cost_per_click: '',
      start_date: '',
      end_date: '',
      promotionModel: 'standard',
      description: '',
      isSeasonal: false,
      status: 'active',
      location_name: '',
      alert_radius: '',
      latitude: '',
      longitude: '',
    })

    onCreated?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold shadow-md hover:-translate-y-0.5 transition-transform whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />{' '}
          {t('ads.create_campaign', 'Create Ad')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {t('ads.create_campaign', 'Create New Ad Campaign')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-5 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Campaign Title */}
              <div className="space-y-2">
                <Label>{t('common.title', 'Campaign Title')} *</Label>
                <Input
                  placeholder={t('common.title', 'Campaign Title')}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* 2. Category Selection (Combobox) */}
              <div className="space-y-2 flex flex-col">
                <Label>{t('common.category', 'Category')} *</Label>
                <Popover open={openCombo} onOpenChange={setOpenCombo}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombo}
                      className="justify-between w-full font-normal"
                    >
                      {form.category
                        ? categories.find((c) => c.name === form.category)
                            ?.label
                        : t('common.select_category', 'Select a category...')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t('common.search', 'Search...')}
                      />
                      <CommandList>
                        <CommandEmpty>{t('common.none', 'None')}</CommandEmpty>
                        <CommandGroup>
                          {categories.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.label}
                              onSelect={() => {
                                setForm({ ...form, category: c.name })
                                setOpenCombo(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  form.category === c.name
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {c.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Placement */}
              <div className="space-y-2">
                <Label>{t('admin.ads.placement', 'Placement')}</Label>
                <Select
                  value={form.placement || undefined}
                  onValueChange={(v) => setForm({ ...form, placement: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACEMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Billing Type */}
              <div className="space-y-2">
                <Label>{t('admin.ads.billing_type', 'Billing Type')}</Label>
                <Select
                  value={form.billing_type || undefined}
                  onValueChange={(v) => setForm({ ...form, billing_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label>{t('admin.ads.price', 'Price')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label>{t('admin.ads.budget', 'Budget')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* CPC */}
              <div className="space-y-2">
                <Label>{t('admin.ads.cpc', 'Cost Per Click (CPC)')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.cost_per_click}
                  onChange={(e) =>
                    setForm({ ...form, cost_per_click: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>{t('admin.status', 'Status')}</Label>
                <Select
                  value={form.status || undefined}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t('admin.active', 'Active')}
                    </SelectItem>
                    <SelectItem value="paused">
                      {t('admin.paused', 'Paused')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>{t('admin.startDate', 'Start Date')}</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>{t('admin.endDate', 'End Date')}</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                />
              </div>

              {/* Location Name */}
              <div className="space-y-2 md:col-span-2">
                <Label>Location Name</Label>
                <Input
                  value={form.location_name}
                  onChange={(e) =>
                    setForm({ ...form, location_name: e.target.value })
                  }
                  placeholder="Ex: Shopping Mall"
                />
              </div>

              {/* Latitude */}
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  placeholder="-23.55052"
                />
              </div>

              {/* Longitude */}
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  placeholder="-46.633308"
                />
              </div>

              {/* Alert Radius */}
              <div className="space-y-2 md:col-span-2">
                <Label>Alert Radius (Meters)</Label>
                <Input
                  type="number"
                  step="1"
                  value={form.alert_radius}
                  onChange={(e) =>
                    setForm({ ...form, alert_radius: e.target.value })
                  }
                  placeholder="e.g. 500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Will notify users who pass within this radius.
                </p>
              </div>

              {/* Promotion Model */}
              <div className="space-y-2">
                <Label>
                  {t('admin.offers.modal.model_title', 'Promotion Model')}
                </Label>
                <Select
                  value={form.promotionModel || undefined}
                  onValueChange={(v) => setForm({ ...form, promotionModel: v })}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      {t('admin.offers.modal.standard_voucher', 'Standard')}
                    </SelectItem>
                    <SelectItem value="buy_x_get_y">
                      {t('admin.offers.modal.buy_x_get_y', 'Buy X Get Y')}
                    </SelectItem>
                    <SelectItem value="voucher">Voucher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Platform Selection (Affiliate Only) */}
            {(role === 'affiliate' || profile?.is_affiliate) && (
              <div className="space-y-2">
                <Label>Approved Platform</Label>
                <Select
                  value={selectedPlatform || undefined}
                  onValueChange={(v) => setSelectedPlatform(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an approved platform..." />
                  </SelectTrigger>
                  <SelectContent>
                    {affiliatePlatforms.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                    {affiliatePlatforms.length === 0 && (
                      <SelectItem value="none" disabled>
                        No approved platforms found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Link */}
            <div className="space-y-2">
              <Label>{t('admin.ads.form_link', 'Destination Link')}</Label>
              <Input
                placeholder="https://..."
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>

            {/* Image Upload/Preview Area */}
            <div className="space-y-2">
              <Label>
                {t('merchant.pre_launch.campaign_image', 'Campaign Image')}
              </Label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
              />
              {form.image ? (
                <div className="relative group mt-2 h-32 w-full rounded-md border overflow-hidden">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setForm({ ...form, image: '' })}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('common.remove', 'Remove')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 h-32 w-full rounded-md border-2 border-dashed hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-50/80 transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 mb-2 animate-spin text-primary" />
                      <span className="text-sm">
                        {t('common.uploading', 'Uploading...')}
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                      <span className="text-sm font-medium">
                        {t('common.click_to_upload', 'Click to upload image')}
                      </span>
                      <span className="text-xs mt-1">
                        JPG, PNG, WEBP (Max 5MB)
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Campaign Description */}
            <div className="space-y-2">
              <Label>{t('common.description', 'Description')}</Label>
              <Textarea
                placeholder={t(
                  'admin.offers.modal.desc_placeholder',
                  'Provide detailed information about the promotion...',
                )}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>

            {/* Is Seasonal Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label className="text-base">
                  {t('merchant.pre_launch.mark_seasonal', 'Seasonal Offer')}
                </Label>
                <p className="text-sm text-slate-500">
                  {t(
                    'admin.offers.modal.seasonal_campaign_desc',
                    'Mark this campaign as a seasonal or holiday special.',
                  )}
                </p>
              </div>
              <Switch
                checked={form.isSeasonal}
                onCheckedChange={(v) => setForm({ ...form, isSeasonal: v })}
              />
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t flex justify-end gap-3 bg-slate-50/50 rounded-b-lg shrink-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isUploading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            {t('common.save', 'Save Campaign')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
