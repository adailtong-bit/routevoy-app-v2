import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
  initialData = null,
}: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promotion_model: 'standard',
    discount_percentage: '',
    original_price: '',
    price: '',
    purchase_value: '',
    reward_value: '',
    is_seasonal: false,
  })

  useEffect(() => {
    if (initialData && open) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        promotion_model: initialData.promotion_model || 'standard',
        discount_percentage: initialData.discount_percentage || '',
        original_price: initialData.original_price || '',
        price: initialData.price || '',
        purchase_value: initialData.trigger_threshold || '',
        reward_value: initialData.reward_value || '',
        is_seasonal: initialData.is_seasonal || false,
      })
    } else if (open) {
      setFormData({
        title: '',
        description: '',
        promotion_model: 'standard',
        discount_percentage: '',
        original_price: '',
        price: '',
        purchase_value: '',
        reward_value: '',
        is_seasonal: false,
      })
    }
  }, [initialData, open])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }

      if (next.promotion_model === 'pure_discount') {
        if (field === 'original_price' || field === 'discount_percentage') {
          const orig = parseFloat(next.original_price) || 0
          const disc = parseFloat(next.discount_percentage) || 0
          if (orig > 0 && disc >= 0) {
            next.price = (orig - disc).toFixed(2)
          }
        }
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      title: formData.title,
      description: formData.description,
      promotion_model: formData.promotion_model,
      discount_percentage: formData.discount_percentage
        ? Number(formData.discount_percentage)
        : null,
      original_price: formData.original_price
        ? Number(formData.original_price)
        : null,
      price: formData.price ? Number(formData.price) : null,
      trigger_threshold: formData.purchase_value
        ? Number(formData.purchase_value)
        : null,
      reward_value: formData.reward_value
        ? Number(formData.reward_value)
        : null,
      is_seasonal: formData.is_seasonal,
      company_id: companyId,
      status: initialData ? initialData.status : 'active',
      environment: 'production',
    }

    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from('discovered_promotions')
          .update(payload)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Promotion updated successfully!')
      } else {
        const { error } = await supabase
          .from('discovered_promotions')
          .insert([payload])
        if (error) throw error
        toast.success('Promotion created successfully!')
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Promotion' : 'Create New Promotion'}
          </DialogTitle>
          <DialogDescription>
            Configure your campaign details and promotion model below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Campaign Title</Label>
            <Input
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Summer Super Sale"
            />
          </div>

          <div className="space-y-2 border p-4 rounded-md bg-slate-50">
            <Label className="text-base font-semibold">Promotion Model</Label>
            <Select
              value={formData.promotion_model}
              onValueChange={(v) => handleChange('promotion_model', v)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Voucher</SelectItem>
                <SelectItem value="pure_discount">
                  Pure Discount (Price Comparison)
                </SelectItem>
                <SelectItem value="buy_x_get_y">Buy X, Get Y</SelectItem>
              </SelectContent>
            </Select>

            <div className="mt-4">
              {formData.promotion_model === 'standard' && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Discount Percentage (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) =>
                      handleChange('discount_percentage', e.target.value)
                    }
                    placeholder="e.g. 80"
                    className="bg-white"
                  />
                  <p className="text-xs text-slate-500">
                    Only the title, description, and discount percentage will be
                    shown.
                  </p>
                </div>
              )}

              {formData.promotion_model === 'pure_discount' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Original Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.original_price}
                      onChange={(e) =>
                        handleChange('original_price', e.target.value)
                      }
                      className="bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discount_percentage}
                      onChange={(e) =>
                        handleChange('discount_percentage', e.target.value)
                      }
                      className="bg-white"
                      placeholder="Amount off"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Final Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      className="bg-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {formData.promotion_model === 'buy_x_get_y' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Purchase Value (X)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.purchase_value}
                      onChange={(e) =>
                        handleChange('purchase_value', e.target.value)
                      }
                      className="bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount/Reward Value (Y)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.reward_value}
                      onChange={(e) =>
                        handleChange('reward_value', e.target.value)
                      }
                      className="bg-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Promotion Description</Label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional details, rules or conditions..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4 bg-white shadow-sm">
            <div className="space-y-1">
              <Label className="text-base">Seasonal Campaign</Label>
              <p className="text-sm text-slate-500">
                Highlight this offer on holidays and special events.
              </p>
            </div>
            <Switch
              checked={formData.is_seasonal}
              onCheckedChange={(v) => handleChange('is_seasonal', v)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Promotion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
