import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRef } from 'react'
import { Edit2, Plus, Trash2, Loader2, UploadCloud, X } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

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

export function AdCampaignsTab({
  environment = 'production',
  companyId,
}: {
  environment?: string
  companyId?: string
}) {
  const { t } = useLanguage()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [advertisers, setAdvertisers] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const defaultForm = {
    title: '',
    advertiser_id: 'none',
    category: '',
    description: '',
    image: '',
    link: '',
    price: '',
    budget: '',
    cost_per_click: '',
    placement: 'home_hero',
    billing_type: 'fixed',
    start_date: '',
    end_date: '',
    priority_score: '0',
    status: 'active',
    alert_radius: '',
    latitude: '',
    longitude: '',
  }

  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    fetchCampaigns()
    fetchAdvertisers()
  }, [environment, companyId])

  const fetchCampaigns = async () => {
    let query = supabase
      .from('ad_campaigns')
      .select('*, ad_advertisers(company_name)')
      .eq('environment', environment)
      .order('created_at', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data } = await query
    if (data) setCampaigns(data)
  }

  const fetchAdvertisers = async () => {
    const { data } = await supabase
      .from('ad_advertisers')
      .select('id, company_name')
      .eq('environment', environment)
      .order('company_name', { ascending: true })
    if (data) setAdvertisers(data)
  }

  const handleEdit = (camp: any) => {
    setEditingId(camp.id)
    setFormData({
      title: camp.title || '',
      advertiser_id: camp.advertiser_id || 'none',
      category: camp.category || '',
      description: camp.description || '',
      image: camp.image || '',
      link: camp.link || '',
      price: camp.price?.toString() || '',
      budget: camp.budget?.toString() || '',
      cost_per_click: camp.cost_per_click?.toString() || '',
      placement: camp.placement || 'home_hero',
      billing_type: camp.billing_type || 'fixed',
      start_date: camp.start_date ? camp.start_date.split('T')[0] : '',
      end_date: camp.end_date ? camp.end_date.split('T')[0] : '',
      priority_score: camp.priority_score?.toString() || '0',
      status: camp.status || 'active',
      alert_radius: camp.alert_radius?.toString() || '',
      latitude: camp.latitude?.toString() || '',
      longitude: camp.longitude?.toString() || '',
    })
    setIsDialogOpen(true)
  }

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
      const fileName = `${companyId || 'admin'}_${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('ad-campaigns')
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('ad-campaigns')
        .getPublicUrl(fileName)

      setFormData({ ...formData, image: publicUrlData.publicUrl })
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

  const handleDelete = async (id: string) => {
    if (
      !confirm(t('common.confirm_delete', 'Are you sure you want to delete?'))
    )
      return
    const { error } = await supabase.from('ad_campaigns').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success(t('common.success', 'Deleted successfully'))
      fetchCampaigns()
    }
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error(t('common.error', 'Title is required'))
      return
    }

    setIsLoading(true)
    const payload = {
      title: formData.title,
      advertiser_id:
        formData.advertiser_id === 'none' ? null : formData.advertiser_id,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      link: formData.link,
      price: formData.price ? parseFloat(formData.price) : null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      cost_per_click: formData.cost_per_click
        ? parseFloat(formData.cost_per_click)
        : null,
      placement: formData.placement,
      billing_type: formData.billing_type,
      start_date: formData.start_date
        ? new Date(formData.start_date).toISOString()
        : null,
      end_date: formData.end_date
        ? new Date(formData.end_date).toISOString()
        : null,
      priority_score: parseInt(formData.priority_score) || 0,
      status: formData.status,
      environment,
      company_id: companyId || null,
      alert_radius: formData.alert_radius
        ? parseFloat(formData.alert_radius)
        : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    }

    let error
    // Prevent activating demo campaigns
    const isEditingDemo = editingId
      ? campaigns.find((c) => c.id === editingId)?.is_demo
      : false
    if (isEditingDemo && payload.status === 'active') {
      toast.error('Demonstration campaigns cannot be activated.')
      setIsLoading(false)
      return
    }

    if (editingId) {
      const res = await supabase
        .from('ad_campaigns')
        .update(payload)
        .eq('id', editingId)
      error = res.error
    } else {
      const res = await supabase.from('ad_campaigns').insert(payload)
      error = res.error
    }

    setIsLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(t('common.success', 'Saved successfully'))
      setIsDialogOpen(false)
      fetchCampaigns()
    }
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          {t('admin.ad_manager.campaigns', 'Campaigns')}
        </h3>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData(defaultForm)
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />{' '}
          {t('ads.create_campaign', 'Create Campaign')}
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('admin.ads.title', 'Title')}</TableHead>
              <TableHead>{t('ads.advertiser', 'Advertiser')}</TableHead>
              <TableHead>{t('admin.ads.placement', 'Placement')}</TableHead>
              <TableHead>{t('admin.ads.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {ad.image && (
                      <img
                        src={ad.image}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {ad.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        {BILLING_OPTIONS.find(
                          (o) => o.value === ad.billing_type,
                        )?.label || ad.billing_type}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{ad.ad_advertisers?.company_name || '-'}</TableCell>
                <TableCell>
                  {PLACEMENT_OPTIONS.find((o) => o.value === ad.placement)
                    ?.label || ad.placement}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={ad.status === 'active' ? 'default' : 'secondary'}
                  >
                    {ad.is_demo
                      ? t(
                          'admin.public.card.demo_example_status',
                          'Demonstração',
                        )
                      : ad.status === 'active'
                        ? t('admin.active', 'Active')
                        : ad.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(ad)}
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-slate-500"
                >
                  {t('common.none', 'No data found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {editingId
                ? t('common.edit', 'Edit Campaign')
                : t('ads.create_campaign', 'Create Campaign')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.ads.form_title', 'Ad Title')} *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Super Promotion"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('ads.advertiser', 'Linked Advertiser')}</Label>
                  <Select
                    value={formData.advertiser_id}
                    onValueChange={(v) =>
                      setFormData({ ...formData, advertiser_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('common.select', 'Select...')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t('ads.none_internal_use', 'None / Internal Use')}
                      </SelectItem>
                      {advertisers.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.ads.placement', 'Placement')}</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={(v) =>
                      setFormData({ ...formData, placement: v })
                    }
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
                <div className="space-y-2">
                  <Label>{t('admin.ads.billing_type', 'Billing Type')}</Label>
                  <Select
                    value={formData.billing_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, billing_type: v })
                    }
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

                <div className="space-y-2">
                  <Label>{t('admin.ads.price', 'Price / Budget')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.ads.budget', 'Total Budget')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.ads.cpc', 'Cost Per Click (CPC)')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_click}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cost_per_click: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.category', 'Category')}</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g. Fashion, Food"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.startDate', 'Start Date')}</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.endDate', 'End Date')}</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Raio de Alerta (km)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.alert_radius}
                    onChange={(e) =>
                      setFormData({ ...formData, alert_radius: e.target.value })
                    }
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    placeholder="-23.55052"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    placeholder="-46.633308"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('admin.ads.priority_score', 'Priority Score')}
                  </Label>
                  <Input
                    type="number"
                    value={formData.priority_score}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority_score: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.status', 'Status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
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
                      {editingId &&
                        campaigns.find((c) => c.id === editingId)?.is_demo && (
                          <SelectItem value="expired" disabled>
                            {t('admin.public.card.expired_status', 'Expirado')}{' '}
                            (Demo)
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.ads.form_link', 'Destination Link')}</Label>
                <Input
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.ads.form_image', 'Campaign Image')}</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                />
                {formData.image ? (
                  <div className="relative group mt-2 h-32 w-full rounded-md border overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormData({ ...formData, image: '' })}
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

              <div className="space-y-2">
                <Label>{t('common.description', 'Description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-4 border-t flex justify-end gap-3 bg-slate-50/50 rounded-b-lg shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isUploading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.save', 'Save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
