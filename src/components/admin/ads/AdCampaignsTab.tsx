import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Edit2,
  Plus,
  Trash2,
  Loader2,
  UploadCloud,
  X,
  ImageOff,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLocation } from 'react-router-dom'
import { CampaignPreview } from '@/components/merchant/CampaignPreview'

const PLACEMENT_OPTIONS = [
  { value: 'top_ranking', label: 'Top Ranking' },
  { value: 'lateral_highlight', label: 'Sidebar Highlight' },
  { value: 'main_banner', label: 'Main Banner' },
  { value: 'home_featured', label: 'Home Featured' },
  { value: 'home_hero', label: 'Home Hero' },
  { value: 'global_search', label: 'Global Search' },
  { value: 'offer_of_the_day', label: 'Offer of the Day' },
  { value: 'sponsored_push', label: 'Sponsored Push' },
]

const BILLING_OPTIONS = [
  { value: 'internal_boost', label: 'Internal Boost (Coupon)' },
  { value: 'internal', label: 'Internal Boost (Legacy)' },
  { value: 'cpc', label: 'CPC (Cost per Click)' },
  { value: 'cpm', label: 'CPM (Cost per Mille)' },
  { value: 'external', label: 'External Advertising' },
  { value: 'fixed', label: 'Fixed (Period)' },
]

const PROMOTION_MODELS = [
  { value: 'standard', label: 'Standard / Voucher' },
  { value: 'fixed_discount', label: 'Fixed Discount' },
  { value: 'buy_and_get', label: 'Buy and Get' },
]

export function AdCampaignsTab({
  environment = 'production',
  companyId,
  franchiseId,
  affiliateId,
}: {
  environment?: string
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}) {
  const { t } = useLanguage()
  const location = useLocation()
  const isAdminView = location.pathname.startsWith('/admin')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [advertisers, setAdvertisers] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const defaultForm = {
    title: '',
    company_id: 'none',
    advertiser_id: 'none',
    category: '',
    description: '',
    image: '',
    link: '',
    price: '',
    original_price: '',
    discount_percentage: '',
    promotion_model: 'standard',
    budget: '',
    cost_per_click: '',
    placement: 'home_hero',
    billing_type: 'fixed',
    start_date: '',
    end_date: '',
    total_limit: '',
    priority_score: '0',
    status: 'active',
    location_name: '',
    alert_radius: '',
    latitude: '',
    longitude: '',
    trigger_type: '',
    trigger_threshold: '',
    reward_description: '',
    reward_value: '',
    is_demo: false,
  }

  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    fetchCampaigns()
    fetchAdvertisers()
    fetchMerchants()
  }, [environment, companyId])

  const fetchMerchants = async () => {
    const { data } = await supabase
      .from('merchants')
      .select('id, name')
      .order('name', { ascending: true })
    if (data) setMerchants(data)
  }

  const fetchCampaigns = async () => {
    let query = supabase
      .from('ad_campaigns')
      .select('*, ad_advertisers(company_name)')
      .order('created_at', { ascending: false })

    if (!isAdminView) {
      query = query.eq('environment', environment)
      if (companyId) query = query.eq('company_id', companyId)
      if (franchiseId) query = query.eq('franchise_id', franchiseId)
      if (affiliateId) query = query.eq('affiliate_id', affiliateId)
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
      company_id: camp.company_id || 'none',
      advertiser_id: camp.advertiser_id || 'none',
      category: camp.category || '',
      description: camp.description || '',
      image: camp.image || '',
      link: camp.link || '',
      price: camp.price?.toString() || '',
      original_price: camp.original_price?.toString() || '',
      discount_percentage: camp.discount_percentage?.toString() || '',
      promotion_model: camp.promotion_model || 'standard',
      budget: camp.budget?.toString() || '',
      cost_per_click: camp.cost_per_click?.toString() || '',
      placement: camp.placement || 'home_hero',
      billing_type: camp.billing_type || 'fixed',
      start_date: camp.start_date ? camp.start_date.split('T')[0] : '',
      end_date: camp.end_date ? camp.end_date.split('T')[0] : '',
      total_limit: camp.total_limit?.toString() || '',
      priority_score: camp.priority_score?.toString() || '0',
      status: camp.status || 'active',
      location_name: camp.location_name || '',
      alert_radius: camp.alert_radius?.toString() || '',
      latitude: camp.latitude?.toString() || '',
      longitude: camp.longitude?.toString() || '',
      trigger_type: camp.trigger_type || '',
      trigger_threshold: camp.trigger_threshold?.toString() || '',
      reward_description: camp.reward_description || '',
      reward_value: camp.reward_value?.toString() || '',
      is_demo: camp.is_demo || false,
    })
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG and WEBP are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.')
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${isAdminView ? 'admin' : companyId || 'global'}_${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('ad-campaigns')
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('ad-campaigns')
        .getPublicUrl(fileName)

      setFormData({ ...formData, image: publicUrlData.publicUrl })
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the campaign "${title}"? This action cannot be undone.`,
      )
    )
      return
    const { error } = await supabase.from('ad_campaigns').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Deleted successfully')
      fetchCampaigns()
    }
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Title is required')
      return
    }

    if (formData.status === 'active' && !formData.image) {
      toast.error('A Campaign Image is required for active campaigns.')
      return
    }

    setIsLoading(true)
    const payload = {
      title: formData.title,
      company_id:
        formData.company_id === 'none'
          ? companyId || null
          : formData.company_id,
      advertiser_id:
        formData.advertiser_id === 'none' ? null : formData.advertiser_id,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      link: formData.link,
      price: formData.price ? parseFloat(formData.price) : null,
      original_price: formData.original_price
        ? parseFloat(formData.original_price)
        : null,
      discount_percentage: formData.discount_percentage
        ? parseFloat(formData.discount_percentage)
        : null,
      promotion_model: formData.promotion_model,
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
      total_limit: formData.total_limit ? parseInt(formData.total_limit) : null,
      priority_score: parseInt(formData.priority_score) || 0,
      status: formData.status,
      environment,
      franchise_id: franchiseId || null,
      affiliate_id: affiliateId || null,
      location_name: formData.location_name || null,
      alert_radius: formData.alert_radius
        ? parseFloat(formData.alert_radius)
        : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      trigger_type: formData.trigger_type || null,
      trigger_threshold: formData.trigger_threshold
        ? parseInt(formData.trigger_threshold)
        : null,
      reward_description: formData.reward_description || null,
      reward_value: formData.reward_value
        ? parseFloat(formData.reward_value)
        : null,
      is_demo: formData.is_demo,
    }

    let error
    if (payload.is_demo && payload.status === 'active') {
      toast.error(
        'Demonstration campaigns cannot be active. Please uncheck "Is Demo" to activate.',
      )
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
      toast.success('Saved successfully')
      setIsDialogOpen(false)
      fetchCampaigns()
    }
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">Ads Campaigns</h3>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData(defaultForm)
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Ad Campaign
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Store / Company</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {ad.image ? (
                      <img
                        src={ad.image}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded border border-slate-200 shrink-0">
                        <ImageOff className="w-4 h-4 text-slate-400" />
                      </div>
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
                <TableCell>
                  {ad.company_id ? (
                    merchants.find((m) => m.id === ad.company_id)?.name ||
                    ad.company_id.substring(0, 8) + '...'
                  ) : (
                    <span className="text-slate-400 italic">Unlinked</span>
                  )}
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
                      ? 'Demonstration'
                      : ad.status === 'active'
                        ? 'Active'
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
                    onClick={() => handleDelete(ad.id, ad.title)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-slate-500"
                >
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw] flex flex-col p-0 bg-slate-50 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {editingId ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1">
                Configure all geolocation rules, pricing, limits, and triggers
                for your campaign.
              </p>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Column: Form */}
            <div className="w-full lg:w-3/5 overflow-y-auto p-6 bg-white border-r border-slate-200">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-6 bg-slate-100/80 p-1 w-full flex overflow-x-auto justify-start">
                  <TabsTrigger
                    value="basic"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Basic
                  </TabsTrigger>
                  <TabsTrigger
                    value="pricing"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Pricing & Rules
                  </TabsTrigger>
                  <TabsTrigger
                    value="geolocation"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Geolocation
                  </TabsTrigger>
                  <TabsTrigger
                    value="triggers"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Triggers & Rewards
                  </TabsTrigger>
                </TabsList>

                {/* BASIC TAB */}
                <TabsContent value="basic" className="space-y-4 outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Campaign Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g. Mega Sale"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="e.g. Fashion, Food"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the offer..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign Image OR URL:</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 h-32 w-full rounded-md border-2 border-dashed hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-50/80 transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-8 w-8 mb-2 animate-spin text-primary" />
                          <span className="text-sm">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                          <span className="text-sm font-medium">
                            Click to upload image
                          </span>
                          <span className="text-xs mt-1">
                            JPG, PNG, WEBP (Max 5MB)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Destination Link</Label>
                    <Input
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </TabsContent>

                {/* PRICING & RULES TAB */}
                <TabsContent value="pricing" className="space-y-4 outline-none">
                  <div className="space-y-4 p-4 border rounded-xl bg-slate-50/50">
                    <div className="space-y-2">
                      <Label>Promotion Model</Label>
                      <Select
                        value={formData.promotion_model}
                        onValueChange={(v) =>
                          setFormData({ ...formData, promotion_model: v })
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROMOTION_MODELS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Original Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.original_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              original_price: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Price / Value</Label>
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
                        <Label>Discount (%)</Label>
                        <Input
                          type="number"
                          value={formData.discount_percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount_percentage: e.target.value,
                            })
                          }
                          placeholder="e.g. 20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="space-y-2">
                      <Label>Total Usage Limit</Label>
                      <Input
                        type="number"
                        value={formData.total_limit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            total_limit: e.target.value,
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 border rounded-xl bg-slate-50/50 mt-4">
                    <h4 className="font-semibold text-sm">Billing Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Store / Company (Merchant)</Label>
                        <Select
                          value={formData.company_id}
                          onValueChange={(v) =>
                            setFormData({ ...formData, company_id: v })
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select a store..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Unlinked (Global / Internal)
                            </SelectItem>
                            {merchants.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Linked Advertiser</Label>
                        <Select
                          value={formData.advertiser_id}
                          onValueChange={(v) =>
                            setFormData({ ...formData, advertiser_id: v })
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              None / Internal Use
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
                        <Label>Placement</Label>
                        <Select
                          value={formData.placement}
                          onValueChange={(v) =>
                            setFormData({ ...formData, placement: v })
                          }
                        >
                          <SelectTrigger className="bg-white">
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
                        <Label>Billing Type</Label>
                        <Select
                          value={formData.billing_type}
                          onValueChange={(v) =>
                            setFormData({ ...formData, billing_type: v })
                          }
                        >
                          <SelectTrigger className="bg-white">
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
                        <Label>Total Budget</Label>
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
                        <Label>Priority Score</Label>
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
                        <Label>Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(v) =>
                            setFormData({ ...formData, status: v })
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 flex items-center pt-8">
                        <Checkbox
                          id="is_demo"
                          checked={formData.is_demo}
                          onCheckedChange={(v) =>
                            setFormData({ ...formData, is_demo: !!v })
                          }
                        />
                        <Label
                          htmlFor="is_demo"
                          className="ml-2 cursor-pointer"
                        >
                          Is Demo (Seed Data)
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* GEOLOCATION TAB */}
                <TabsContent
                  value="geolocation"
                  className="space-y-4 outline-none"
                >
                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input
                      value={formData.location_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location_name: e.target.value,
                        })
                      }
                      placeholder="Ex: Shopping Mall"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          setFormData({
                            ...formData,
                            longitude: e.target.value,
                          })
                        }
                        placeholder="-46.633308"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Alert Radius (Meters)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={formData.alert_radius}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alert_radius: e.target.value,
                        })
                      }
                      placeholder="e.g. 500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Will notify users who pass within this radius.
                    </p>
                  </div>
                </TabsContent>

                {/* TRIGGERS & REWARDS TAB */}
                <TabsContent
                  value="triggers"
                  className="space-y-4 outline-none"
                >
                  <div className="space-y-4 p-4 border rounded-xl bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Trigger Type</Label>
                        <Select
                          value={formData.trigger_type}
                          onValueChange={(v) =>
                            setFormData({ ...formData, trigger_type: v })
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select trigger..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visit">Store Visit</SelectItem>
                            <SelectItem value="share">Social Share</SelectItem>
                            <SelectItem value="amount_spent">
                              Amount Spent
                            </SelectItem>
                            <SelectItem value="specific_action">
                              Specific Action
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Threshold Quantity</Label>
                        <Input
                          type="number"
                          value={formData.trigger_threshold}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              trigger_threshold: e.target.value,
                            })
                          }
                          placeholder="e.g. 3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Reward Description (Text)</Label>
                      <Input
                        value={formData.reward_description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reward_description: e.target.value,
                          })
                        }
                        placeholder="e.g. Get a free dessert"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Reward Value</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.reward_value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reward_value: e.target.value,
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column: Preview */}
            <div className="hidden lg:flex w-2/5 flex-col items-center bg-slate-100 p-8 pt-10 sticky top-0 h-full overflow-y-auto">
              <div className="mb-4 text-center">
                <h4 className="font-bold text-slate-500 uppercase tracking-widest text-xs">
                  PREVIEW
                </h4>
              </div>
              <CampaignPreview
                title={formData.title}
                description={formData.description}
                image={formData.image}
                startDate={formData.start_date}
                endDate={formData.end_date}
                companyUrl={formData.link}
                discountPercentage={formData.discount_percentage}
                originalPrice={formData.original_price}
                price={formData.price}
                promotionModel={formData.promotion_model}
                rewardDescription={formData.reward_description}
                minimumPurchase={formData.trigger_threshold}
                isOnline={true}
              />
            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-3 bg-white shadow-sm z-10 shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || isUploading}
              className="min-w-[120px]"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
