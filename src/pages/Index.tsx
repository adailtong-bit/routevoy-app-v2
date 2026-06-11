import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Percent,
  Gift,
  CreditCard,
  ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useNavigate, Navigate } from 'react-router-dom'

const MODALITIES = [
  {
    id: 'standard',
    title: 'Standard Discount',
    desc: 'Based on a percentage value.',
    icon: Percent,
  },
  {
    id: 'compound',
    title: 'Compound Discount',
    desc: 'Percentage plus a secondary rule.',
    icon: Gift,
  },
  {
    id: 'store_credit',
    title: 'Store Credit',
    desc: 'A fixed monetary reward.',
    icon: CreditCard,
  },
]

function CampaignModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
}) {
  const { companyId } = useAuth()
  const [title, setTitle] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [price, setPrice] = useState('')
  const [link, setLink] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [isSeasonal, setIsSeasonal] = useState(false)
  const [promotionModel, setPromotionModel] = useState('standard')
  const [categories, setCategories] = useState<
    { name: string; label: string }[]
  >([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle('')
      setOriginalPrice('')
      setPrice('')
      setLink('')
      setImage('')
      setCategory('')
      setDescription('')
      setIsSeasonal(false)
      setPromotionModel('standard')

      supabase
        .from('categories')
        .select('name, label')
        .eq('status', 'active')
        .then(({ data }) => {
          if (data) setCategories(data)
        })
    }
  }, [open])

  const handleSave = async () => {
    if (!title || !price || !link || !image || !category) {
      toast.error('Please fill in all required fields.')
      return
    }

    if (!link.startsWith('https://')) {
      toast.error('Product Link must start with https://')
      return
    }

    if (!image.startsWith('https://')) {
      toast.error('Image URL must start with https://')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('ad_campaigns').insert({
      title,
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      price: parseFloat(price),
      link,
      image,
      category,
      description,
      is_seasonal: isSeasonal,
      promotion_model: promotionModel,
      company_id: companyId || null,
      status: 'active',
      environment: 'production',
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Campaign created successfully!')
      onSuccess()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh] bg-white overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
          <DialogTitle>Create Campaign</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-6 scroll-smooth">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campaign title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Original Price</Label>
              <Input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Current Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Link *</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL *</Label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image Preview</Label>
            <div className="w-full max-w-sm mx-auto aspect-video border rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
              {image && image.startsWith('http') ? (
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://img.usecurling.com/p/400/300?q=error'
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">No Image Provided</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.label}
                  </SelectItem>
                ))}
                {categories.length === 0 && (
                  <div className="p-2 text-sm text-slate-500 text-center">
                    No categories found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Campaign Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your campaign..."
              className="resize-y min-h-[100px]"
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <Switch
              checked={isSeasonal}
              onCheckedChange={setIsSeasonal}
              id="seasonal-switch"
            />
            <Label
              htmlFor="seasonal-switch"
              className="cursor-pointer font-medium text-slate-700"
            >
              Seasonal
            </Label>
          </div>

          <div className="space-y-3 pt-2">
            <Label>Promotion Modalities</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MODALITIES.map((modality) => {
                const Icon = modality.icon
                const isActive = promotionModel === modality.id
                return (
                  <div
                    key={modality.id}
                    onClick={() => setPromotionModel(modality.id)}
                    className={cn(
                      'border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-sm',
                      isActive
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center mb-3',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-medium text-sm mb-1">
                      {modality.title}
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed">
                      {modality.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50 rounded-b-lg flex flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function IndexContent() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, role, companyId, franchiseId, loading } = useAuth()

  const fetchCampaigns = useCallback(async () => {
    if (user && role === null) return

    let query = supabase
      .from('ad_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (role === 'merchant' || role === 'shopkeeper') {
      if (companyId) {
        query = query.eq('company_id', companyId)
      }
    }

    const { data } = await query
    if (data) setCampaigns(data)
  }, [role, companyId, user, franchiseId])

  useEffect(() => {
    if (!loading) {
      fetchCampaigns()
    }
  }, [loading, user, role, fetchCampaigns])

  const filtered = campaigns.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-transparent animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Offers and Campaigns
          </h1>
          <p className="text-slate-500 mt-2">
            Create, edit, and manage your campaigns on the platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-white"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11 px-6">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((campaign) => (
            <Card
              key={campaign.id}
              className="overflow-hidden bg-white shadow-sm border-slate-200"
            >
              <div className="aspect-video w-full relative bg-slate-100">
                {campaign.image ? (
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                {campaign.category && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur text-xs font-medium rounded shadow-sm text-slate-700">
                    {campaign.category}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {campaign.title}
                </h3>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2 min-h-[40px]">
                  {campaign.description || 'No description'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-bold text-primary text-lg">
                    ${campaign.price}
                  </div>
                  {campaign.original_price && (
                    <div className="text-sm text-slate-400 line-through">
                      ${campaign.original_price}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-dashed rounded-xl">
              No campaigns found.
            </div>
          )}
        </div>
      </div>

      <CampaignModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchCampaigns}
      />
    </div>
  )
}

export default function Index() {
  const { role, user, loading } = useAuth()

  if (loading || (user && role === null))
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
      </div>
    )

  if (user) {
    if (role === 'admin' || role === 'super_admin')
      return <Navigate to="/admin" replace />
    if (role === 'franchisee') return <Navigate to="/franchisee" replace />
    if (role === 'merchant' || role === 'shopkeeper')
      return <Navigate to="/merchant" replace />
    if (role === 'affiliate') return <Navigate to="/affiliate" replace />

    // If authenticated but no matching role, redirect to profile gracefully
    return <Navigate to="/profile" replace />
  }

  return (
    <ErrorBoundary>
      <IndexContent />
    </ErrorBoundary>
  )
}
