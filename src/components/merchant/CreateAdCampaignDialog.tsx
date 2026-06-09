import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Check, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CreateAdCampaignDialog({
  companyId,
  environment = 'production',
  onCreated,
}: {
  companyId?: string
  environment?: string
  onCreated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([
    'General',
    'Fashion',
    'Food & Dining',
    'Electronics',
    'Travel',
    'Health & Beauty',
    'Home & Garden',
    'Services',
    'Automotive',
    'Entertainment',
  ])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    image: '',
    placement: 'main_banner',
    billingType: 'fixed',
    budget: '',
    originalPrice: '',
    discountType: 'percentage',
    discountValue: '',
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    const { data } = await supabase.from('ad_campaigns').select('category')
    if (data) {
      const dbCategories = data.map((d: any) => d.category).filter(Boolean)
      const uniqueCats = Array.from(new Set([...categories, ...dbCategories]))
      setCategories(uniqueCats)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error('Campaign Title is required')
      return
    }

    setLoading(true)
    try {
      let imageUrl = formData.image

      const origPrice = parseFloat(formData.originalPrice) || 0
      const discVal = parseFloat(formData.discountValue) || 0
      let price = origPrice
      let discPercent = 0

      if (origPrice > 0 && discVal > 0) {
        if (formData.discountType === 'percentage') {
          discPercent = discVal
          price = origPrice * (1 - discVal / 100)
        } else {
          price = origPrice - discVal
          discPercent = (discVal / origPrice) * 100
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        placement: formData.placement,
        billing_type: formData.billingType,
        budget: parseFloat(formData.budget) || 0,
        original_price: origPrice,
        price: price,
        discount_percentage: discPercent,
        image: imageUrl,
        company_id: companyId || null,
        environment,
        status: 'active',
      }

      const { error } = await supabase.from('ad_campaigns').insert(payload)

      if (error) throw error

      toast.success('Campaign created successfully')
      setOpen(false)
      onCreated?.()

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'General',
        image: '',
        placement: 'main_banner',
        billingType: 'fixed',
        budget: '',
        originalPrice: '',
        discountType: 'percentage',
        discountValue: '',
      })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Create Campaign
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Campaign Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Summer Super Sale"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Description
                </Label>
                <Textarea
                  placeholder="Describe your offer..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1.5 resize-none h-24"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <Label className="text-sm font-semibold text-slate-700">
                  Category
                </Label>
                <div className="mt-1.5 flex flex-col gap-1 border border-slate-200 rounded-md p-2 max-h-[300px] overflow-y-auto bg-slate-50/50">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() =>
                        setFormData({ ...formData, category: cat })
                      }
                      className={cn(
                        'flex items-center text-left px-3 py-2.5 rounded-md text-sm transition-all duration-200',
                        formData.category === cat
                          ? 'bg-[#10b981] text-white font-medium shadow-sm'
                          : 'hover:bg-slate-200 text-slate-600',
                      )}
                    >
                      {formData.category === cat && (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">
                    Image URL
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="mt-1.5"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Provide a valid image URL for your banner.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">
                      Placement
                    </Label>
                    <Select
                      value={formData.placement}
                      onValueChange={(val) =>
                        setFormData({ ...formData, placement: val })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main_banner">Main Banner</SelectItem>
                        <SelectItem value="top_ranking">Top Ranking</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="feed">Feed</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">
                      Billing Type
                    </Label>
                    <Select
                      value={formData.billingType}
                      onValueChange={(val) =>
                        setFormData({ ...formData, billingType: val })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select billing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="cpc">CPC</SelectItem>
                        <SelectItem value="cpm">CPM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">
                      Total Budget
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">
                      Original Price
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="text-sm font-semibold text-slate-700">
                    Discount Logic
                  </Label>
                  <RadioGroup
                    defaultValue="percentage"
                    value={formData.discountType}
                    onValueChange={(val) =>
                      setFormData({ ...formData, discountType: val })
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label
                        htmlFor="percentage"
                        className="font-normal cursor-pointer text-slate-600"
                      >
                        Percentage (%)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label
                        htmlFor="fixed"
                        className="font-normal cursor-pointer text-slate-600"
                      >
                        Fixed Reduction ($)
                      </Label>
                    </div>
                  </RadioGroup>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">
                      Discount Value
                    </Label>
                    <Input
                      type="number"
                      placeholder={
                        formData.discountType === 'percentage'
                          ? 'e.g. 20'
                          : 'e.g. 15.00'
                      }
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      className="mt-1.5 max-w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Campaign
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
