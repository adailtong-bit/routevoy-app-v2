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
    let query = supabase
      .from('coupons')
      .select('*')
      .eq('environment', 'production')
      .order('created_at', { ascending: false })

    if (myCompany.id !== 'admin-global') {
      query = query.eq('company_id', myCompany.id)
    }

    const { data } = await query
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
      store_name:
        myCompany?.name && myCompany.id !== 'admin-global'
          ? myCompany.name
          : '',
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
      const isPromo = 'promotion_model' in selectedCoupon
      const targetTable = isPromo ? 'discovered_promotions' : 'coupons'

      const { error } = await supabase
        .from(targetTable)
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
    const isPromo = 'promotion_model' in selectedCoupon
    const targetTable = isPromo ? 'discovered_promotions' : 'coupons'

    const { error } = await supabase
      .from(targetTable)
      .delete()
      .eq('id', selectedCoupon.id)

    if (error) toast.error('Error deleting campaign')
    else {
      toast.success('Campaign deleted successfully')
      setIsDeleteOpen(false)
      fetchCoupons()
    }
  }
  if (isLoadingCompany)
    return <div className="p-8">{t('common.loading', 'Loading...')}</div>

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Megaphone className="h-6 w-6 text-primary" />
            {t('merchant.campaigns.title', 'Campaigns')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t(
              'merchant.campaigns.desc',
              'Manage your standard campaigns and coupons.',
            )}
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="w-full sm:w-auto font-bold shadow-md whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />{' '}
          {t('common.create_new', 'Create Campaign')}
        </Button>{' '}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">{t('common.title', 'Title')}</th>
                <th className="px-6 py-4">{t('admin.status', 'Status')}</th>
                <th className="px-6 py-4">
                  {t('admin.offers.discount', 'Discount')}
                </th>
                <th className="px-6 py-4 text-right">
                  {t('common.actions', 'Actions')}
                </th>
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
                      {coupon.status === 'active'
                        ? t('admin.active', 'Active')
                        : t('admin.inactive', 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">{coupon.discount || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(coupon)}
                    >
                      <Edit className="w-4 h-4 mr-1" />{' '}
                      {t('common.edit', 'Edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(coupon)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />{' '}
                      {t('common.delete', 'Delete')}
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
                    {t(
                      'merchant.campaigns_tab.empty_title',
                      'No campaigns found',
                    )}
                  </td>
                </tr>
              )}{' '}
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
              {isEditOpen
                ? t('vendor.form.edit_title', 'Edit Campaign')
                : t('vendor.form.create_title', 'Create Campaign')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>{t('common.title', 'Title')} *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>{t('common.description', 'Description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('vendor.form.store', 'Store Name')}</Label>
              <Input
                value={formData.store_name}
                onChange={(e) =>
                  setFormData({ ...formData, store_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.offers.discount', 'Discount Label')}</Label>
              <Input
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.offers.modal.original_price', 'Original Price')}
              </Label>
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
              <Label>
                {t('admin.offers.modal.final_price', 'Final Price')}
              </Label>
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
              <Label>{t('admin.status', 'Status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t('admin.active', 'Active')}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t('admin.inactive', 'Inactive')}
                  </SelectItem>
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
              <X className="w-4 h-4 mr-2" /> {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={saveCoupon}>
              <Save className="w-4 h-4 mr-2" />{' '}
              {t('common.save', 'Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] w-[95vw] bg-white">
          <DialogHeader>
            <DialogTitle>
              {t('vendor.campaigns_tab.delete_title', 'Delete Campaign?')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">
              {t(
                'vendor.campaigns_tab.delete_desc',
                'Are you sure you want to delete this campaign? This action cannot be undone.',
              )}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button variant="destructive" onClick={deleteCoupon}>
              {t('common.delete', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
