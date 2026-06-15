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
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { useLanguage } from '@/stores/LanguageContext'

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
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [openCombo, setOpenCombo] = useState(false)

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
  })

  useEffect(() => {
    if (open) {
      supabase
        .from('categories')
        .select('id, name, label')
        .eq('status', 'active')
        .order('label')
        .then(({ data }) => data && setCategories(data))
    }
  }, [open])

  const handleSave = async () => {
    if (!form.title || !form.category) {
      return toast.error('Title and Category are required')
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
      price: form.price ? parseFloat(form.price) : null,
      budget: form.budget ? parseFloat(form.budget) : null,
      cost_per_click: form.cost_per_click
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
    }

    const { error } = await supabase.from('ad_campaigns').insert(payload)

    setIsLoading(false)

    if (error) {
      console.error(error)
      return toast.error('Failed to create campaign')
    }

    toast.success('Campaign created successfully')
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
                  value={form.placement}
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
                  value={form.billing_type}
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
                  value={form.status}
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

              {/* Promotion Model */}
              <div className="space-y-2">
                <Label>
                  {t('admin.offers.modal.model_title', 'Promotion Model')}
                </Label>
                <Select
                  value={form.promotionModel}
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
                {t(
                  'merchant.pre_launch.campaign_image',
                  'Campaign Image (URL)',
                )}
              </Label>
              <Input
                placeholder="https://..."
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
              {form.image ? (
                <img
                  src={form.image}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded-md border"
                />
              ) : (
                <div className="mt-2 h-32 w-full rounded-md border border-dashed flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm">{t('common.view', 'Preview')}</span>
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
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            {t('common.save', 'Save Campaign')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
