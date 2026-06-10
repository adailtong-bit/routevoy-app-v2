import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Rocket, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'

export default function MerchantPreLaunch() {
  const { t } = useLanguage()
  const { user, companies } = useCouponStore()
  const { user: authUser, profile } = useAuth()

  const [myCompany, setMyCompany] = useState<any>(null)
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)
  const [promotions, setPromotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: '',
    engagement_threshold: '',
    reward_type: '',
    reward_value: '',
    reward_description: '',
  })

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
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

  const fetchPromotions = async () => {
    if (!myCompany) return
    setIsLoading(true)

    let query = supabase
      .from('discovered_promotions')
      .select('*')
      .eq('promotion_model', 'pre-launch')
      .eq('environment', 'production')
      .order('created_at', { ascending: false })

    if (myCompany.id !== 'admin-global') {
      query = query.eq('company_id', myCompany.id)
    }

    const { data } = await query
    if (data) setPromotions(data)
    setIsLoading(false)
  }

  useEffect(() => {
    if (myCompany) fetchPromotions()
  }, [myCompany?.id])

  const handleCreateClick = () => {
    setFormData({
      title: '',
      engagement_threshold: '',
      reward_type: '',
      reward_value: '',
      reward_description: '',
    })
    setIsCreateOpen(true)
  }

  const handleEditClick = (promo: any) => {
    setSelectedPromo(promo)
    setFormData({
      title: promo.title || '',
      engagement_threshold: promo.engagement_threshold?.toString() || '',
      reward_type: promo.reward_type || '',
      reward_value: promo.reward_value?.toString() || '',
      reward_description: promo.reward_description || '',
    })
    setIsEditOpen(true)
  }

  const handleDeleteClick = (promo: any) => {
    setSelectedPromo(promo)
    setIsDeleteOpen(true)
  }

  const savePromo = async () => {
    const isFreeItem = formData.reward_type === 'Free Item'

    const payload = {
      title: formData.title,
      engagement_threshold: parseInt(formData.engagement_threshold, 10) || null,
      reward_type: formData.reward_type,
      reward_value: isFreeItem
        ? null
        : parseFloat(formData.reward_value) || null,
      reward_description: isFreeItem ? formData.reward_description : null,
      company_id: myCompany?.id === 'admin-global' ? null : myCompany?.id,
      environment: 'production',
      promotion_model: 'pre-launch',
      status: 'active',
    }

    if (isCreateOpen) {
      const { error } = await supabase
        .from('discovered_promotions')
        .insert(payload)
      if (error) toast.error(t('common.error', 'Error creating campaign'))
      else {
        toast.success(t('common.success', 'Campaign created successfully'))
        setIsCreateOpen(false)
        fetchPromotions()
      }
    } else if (isEditOpen && selectedPromo) {
      const { error } = await supabase
        .from('discovered_promotions')
        .update(payload)
        .eq('id', selectedPromo.id)
      if (error) toast.error(t('common.error', 'Error updating campaign'))
      else {
        toast.success(t('common.success', 'Campaign updated successfully'))
        setIsEditOpen(false)
        fetchPromotions()
      }
    }
  }

  const deletePromo = async () => {
    if (!selectedPromo) return
    const { error } = await supabase
      .from('discovered_promotions')
      .delete()
      .eq('id', selectedPromo.id)
    if (error) toast.error(t('common.error', 'Error deleting campaign'))
    else {
      toast.success(t('common.success', 'Campaign deleted successfully'))
      setIsDeleteOpen(false)
      fetchPromotions()
    }
  }

  if (isLoadingCompany)
    return <div className="p-8">{t('common.loading', 'Loading...')}</div>

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Rocket className="h-6 w-6 text-primary" />
            {t('merchant.campaigns.pre_launch_title', 'Pre-launch Campaigns')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t(
              'merchant.campaigns.desc',
              'Manage your pre-launch and trigger-based rewards.',
            )}
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="w-full sm:w-auto font-bold shadow-md whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />{' '}
          {t('merchant.pre_launch.create_btn', 'Create Pre-launch')}
        </Button>{' '}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">{t('common.title', 'Title')}</th>
                <th className="px-6 py-4">
                  {t('merchant.pre_launch.sharing_goal', 'Sharing Goal')}
                </th>
                <th className="px-6 py-4">
                  {t('merchant.pre_launch.reward_to_grant', 'Reward')}
                </th>
                <th className="px-6 py-4">
                  {t('merchant.pre_launch.reward_value', 'Value')}
                </th>
                <th className="px-6 py-4 text-right">
                  {t('common.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr
                  key={promo.id}
                  className="border-b last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {promo.title}
                  </td>
                  <td className="px-6 py-4">
                    {promo.engagement_threshold || 0}
                  </td>
                  <td className="px-6 py-4">{promo.reward_type || '-'}</td>
                  <td className="px-6 py-4">
                    {promo.reward_type === 'Free Item'
                      ? promo.reward_description
                      : promo.reward_value}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(promo)}
                    >
                      <Edit className="w-4 h-4 mr-1" />{' '}
                      {t('common.edit', 'Edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(promo)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />{' '}
                      {t('common.delete', 'Delete')}
                    </Button>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    {t(
                      'merchant.campaigns.no_pre_launch',
                      'No pre-launch campaigns found.',
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
        <DialogContent className="sm:max-w-[500px] w-[95vw] bg-white">
          <DialogHeader>
            <DialogTitle>
              {isCreateOpen
                ? t('merchant.pre_launch.create_btn', 'Create Pre-launch')
                : t('vendor.form.edit_title', 'Edit Campaign')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('common.title', 'Title')}</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('merchant.pre_launch.sharing_goal', 'Sharing Goal')}
              </Label>
              <Input
                type="number"
                value={formData.engagement_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    engagement_threshold: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('merchant.pre_launch.reward_to_grant', 'Reward to Grant')}
              </Label>
              <Select
                value={formData.reward_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, reward_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Store Credit">
                    {t('merchant.pre_launch.store_credit', 'Store Credit')}
                  </SelectItem>
                  <SelectItem value="Compound Discount">
                    {t(
                      'merchant.pre_launch.compound_discount',
                      'Compound Discount',
                    )}
                  </SelectItem>
                  <SelectItem value="Standard Discount">
                    {t(
                      'merchant.pre_launch.standard_discount',
                      'Standard Discount',
                    )}
                  </SelectItem>
                  <SelectItem value="Free Item">
                    {t('merchant.pre_launch.free_item', 'Free Item')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.reward_type === 'Free Item' ? (
              <div className="space-y-2">
                <Label>
                  {t(
                    'merchant.pre_launch.reward_desc_text',
                    'Reward Description',
                  )}
                </Label>
                <Input
                  value={formData.reward_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reward_description: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>
                  {t('merchant.pre_launch.reward_value', 'Reward Value')}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.reward_value}
                  onChange={(e) =>
                    setFormData({ ...formData, reward_value: e.target.value })
                  }
                />
              </div>
            )}
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
            <Button onClick={savePromo}>
              <Save className="w-4 h-4 mr-2" />{' '}
              {isCreateOpen
                ? t('common.save', 'Save')
                : t('common.save', 'Save')}
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
            <Button variant="destructive" onClick={deletePromo}>
              {t('common.delete', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
