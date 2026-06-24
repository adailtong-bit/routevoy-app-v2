import { useState, useEffect } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { X } from 'lucide-react'

export function AdminCouponSheet({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  coupon?: any
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [merchants, setMerchants] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    store_name: '',
    company_id: 'unlinked',
    discount: '',
    category: '',
    code: '',
    status: 'active',
  })

  useEffect(() => {
    async function fetchRelations() {
      try {
        const [merchantsRes, categoriesRes] = await Promise.all([
          supabase.from('merchants').select('id, name').order('name'),
          supabase.from('categories').select('name, label').order('label'),
        ])

        if (merchantsRes.error) throw merchantsRes.error
        if (categoriesRes.error) throw categoriesRes.error

        setMerchants(merchantsRes.data || [])
        setCategories(categoriesRes.data || [])
      } catch (err: any) {
        toast.error('Failed to load form options: ' + err.message)
      }
    }
    if (open) {
      fetchRelations()
    }
  }, [open])

  useEffect(() => {
    if (coupon) {
      setFormData({
        title: coupon.title || '',
        store_name: coupon.store_name || '',
        company_id: coupon.company_id || 'unlinked',
        discount: coupon.discount || '',
        category: coupon.category || '',
        code: coupon.code || '',
        status: coupon.status || 'active',
      })
    } else {
      setFormData({
        title: '',
        store_name: '',
        company_id: 'unlinked',
        discount: '',
        category: '',
        code: '',
        status: 'active',
      })
    }
  }, [coupon, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: formData.title,
        store_name: formData.store_name,
        company_id:
          formData.company_id === 'unlinked' ? null : formData.company_id,
        discount: formData.discount,
        category: formData.category,
        code: formData.code,
        status: formData.status,
        environment: 'production',
        is_demo: false,
      }

      if (coupon?.id) {
        const { error } = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', coupon.id)
        if (error) throw error
        toast.success('Coupon updated successfully')
      } else {
        const { error } = await supabase.from('coupons').insert(payload)
        if (error) throw error
        toast.success('Coupon created successfully')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white border-l"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {coupon ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="coupon-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Coupon Title *
              </Label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. 50% Off Everything"
                className="bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Store Name (Display)
                </Label>
                <Input
                  value={formData.store_name}
                  onChange={(e) =>
                    setFormData({ ...formData, store_name: e.target.value })
                  }
                  placeholder="Store Name"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Link to Merchant Account
                </Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(val) =>
                    setFormData({ ...formData, company_id: val })
                  }
                >
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlinked">Unlinked (Global)</SelectItem>
                    {merchants.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Discount Text
                </Label>
                <Input
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  placeholder="e.g. 50% OFF"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select Category...</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.label || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Promo Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g. SUMMER50"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="coupon-form"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Saving...' : 'Save Coupon'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
