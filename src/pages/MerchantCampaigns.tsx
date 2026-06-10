import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Megaphone, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'

export default function MerchantCampaigns() {
  const { t } = useLanguage()
  const { user, companies } = useCouponStore()
  const { user: authUser, profile } = useAuth()

  const [myCompany, setMyCompany] = useState<any>(null)
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)

  const [coupons, setCoupons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    price: '',
    original_price: '',
    store_name: '',
    status: 'active',
    code: '',
  })

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
        setIsLoadingCompany(false)
        return
      }

      if (authUser?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle()
        if (data) {
          setMyCompany(data)
        } else if (
          profile?.role === 'admin' ||
          profile?.role === 'super_admin'
        ) {
          setMyCompany({ id: 'admin-global', name: 'Admin Global' })
        }
      }
      setIsLoadingCompany(false)
    }
    resolveCompany()
  }, [companies, user, authUser, profile])

  const fetchCoupons = async () => {
    if (!myCompany) return
    setIsLoading(true)
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('company_id', myCompany.id)
      .order('created_at', { ascending: false })
    if (data) setCoupons(data)
    setIsLoading(false)
  }

  useEffect(() => {
    if (myCompany) fetchCoupons()
  }, [myCompany?.id])

  const handleEditClick = (coupon: any) => {
    setSelectedCoupon(coupon)
    setFormData({
      title: coupon.title || '',
      description: coupon.description || '',
      discount: coupon.discount || '',
      price: coupon.price?.toString() || '',
      original_price: coupon.original_price?.toString() || '',
      store_name: coupon.store_name || '',
      status: coupon.status || 'active',
      code: coupon.code || '',
    })
    setIsEditOpen(true)
  }

  const handleDeleteClick = (coupon: any) => {
    setSelectedCoupon(coupon)
    setIsDeleteOpen(true)
  }

  const handleCreateClick = () => {
    setFormData({
      title: '',
      description: '',
      discount: '',
      price: '',
      original_price: '',
      store_name: myCompany?.name || '',
      status: 'active',
      code: '',
    })
    setIsCreateOpen(true)
  }

  const saveCoupon = async () => {
    if (!formData.title) return toast.error('Title is required')

    const payload = {
      title: formData.title,
      description: formData.description,
      discount: formData.discount,
      price: formData.price ? parseFloat(formData.price) : null,
      original_price: formData.original_price
        ? parseFloat(formData.original_price)
        : null,
      store_name: formData.store_name,
      status: formData.status,
      code: formData.code,
      company_id: myCompany.id,
      environment: 'production',
    }

    if (isCreateOpen) {
      const { error } = await supabase.from('coupons').insert(payload)
      if (error) toast.error('Error creating campaign')
      else {
        toast.success('Campaign created successfully')
        setIsCreateOpen(false)
        fetchCoupons()
      }
    } else if (isEditOpen && selectedCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', selectedCoupon.id)
      if (error) toast.error('Error updating campaign')
      else {
        toast.success('Campaign updated successfully')
        setIsEditOpen(false)
        fetchCoupons()
      }
    }
  }

  const deleteCoupon = async () => {
    if (!selectedCoupon) return
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', selectedCoupon.id)
    if (error) toast.error('Error deleting campaign')
    else {
      toast.success('Campaign deleted successfully')
      setIsDeleteOpen(false)
      fetchCoupons()
    }
  }

  if (isLoadingCompany) return <div className="p-8">Loading...</div>

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Megaphone className="h-6 w-6 text-primary" />
            {t('merchant.nav.campaigns', 'Campaigns')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your standard campaigns and coupons.
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="w-full sm:w-auto font-bold shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Campaign
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {coupon.title}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}
                    >
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{coupon.discount || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(coupon)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(coupon)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No campaigns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={isEditOpen || isCreateOpen}
        onOpenChange={(val) => {
          if (!val) {
            setIsEditOpen(false)
            setIsCreateOpen(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] w-[95vw] bg-white">
          <DialogHeader>
            <DialogTitle>
              {isEditOpen ? 'Edit Campaign' : 'Create Campaign'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                value={formData.store_name}
                onChange={(e) =>
                  setFormData({ ...formData, store_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Label</Label>
              <Input
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Original Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) =>
                  setFormData({ ...formData, original_price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Final Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false)
                setIsCreateOpen(false)
              }}
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={saveCoupon}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] w-[95vw] bg-white">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">
              Are you sure you want to delete this campaign? This action cannot
              be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteCoupon}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
