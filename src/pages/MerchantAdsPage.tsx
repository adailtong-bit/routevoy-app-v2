import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Megaphone, Edit, Trash2, Save, X } from 'lucide-react'
import { CreateAdCampaignDialog } from '@/components/merchant/CreateAdCampaignDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'

export default function MerchantAdsPage() {
  const { t } = useLanguage()
  const { user, companies } = useCouponStore()
  const { user: authUser, profile } = useAuth()

  const [myCompany, setMyCompany] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: '',
    priority_score: '',
    link: '',
    image: '',
    start_date: '',
    end_date: '',
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
        if (data) setMyCompany(data)
      }
    }
    resolveCompany()
  }, [companies, user, authUser, profile])

  const fetchAds = async () => {
    if (!myCompany) return
    setIsLoading(true)
    const { data } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('company_id', myCompany.id)
      .eq('environment', 'production')
      .order('created_at', { ascending: false })
    if (data) setAds(data)
    setIsLoading(false)
  }

  useEffect(() => {
    if (myCompany) fetchAds()
  }, [myCompany?.id])

  const handleEditClick = (ad: any) => {
    setSelectedAd(ad)
    setFormData({
      title: ad.title || '',
      priority_score: ad.priority_score?.toString() || '0',
      link: ad.link || '',
      image: ad.image || '',
      start_date: ad.start_date
        ? new Date(ad.start_date).toISOString().split('T')[0]
        : '',
      end_date: ad.end_date
        ? new Date(ad.end_date).toISOString().split('T')[0]
        : '',
    })
    setIsEditOpen(true)
  }

  const handleDeleteClick = (ad: any) => {
    setSelectedAd(ad)
    setIsDeleteOpen(true)
  }

  const saveAd = async () => {
    if (!selectedAd) return

    const payload = {
      title: formData.title,
      priority_score: parseInt(formData.priority_score, 10) || 0,
      link: formData.link,
      image: formData.image,
      start_date: formData.start_date
        ? new Date(formData.start_date).toISOString()
        : null,
      end_date: formData.end_date
        ? new Date(formData.end_date).toISOString()
        : null,
    }

    const { error } = await supabase
      .from('ad_campaigns')
      .update(payload)
      .eq('id', selectedAd.id)
    if (error) toast.error('Error updating advertisement')
    else {
      toast.success('Advertisement updated')
      setIsEditOpen(false)
      fetchAds()
    }
  }

  const deleteAd = async () => {
    if (!selectedAd) return
    const { error } = await supabase
      .from('ad_campaigns')
      .delete()
      .eq('id', selectedAd.id)
    if (error) toast.error('Error deleting advertisement')
    else {
      toast.success('Advertisement deleted')
      setIsDeleteOpen(false)
      fetchAds()
    }
  }

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Megaphone className="h-6 w-6 text-primary" />
            Ads Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your active advertisements.
          </p>
        </div>
        {myCompany && (
          <CreateAdCampaignDialog
            companyId={myCompany.id}
            environment="production"
            onCreated={fetchAds}
          />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Billing Type</th>
                <th className="px-6 py-4">Placement</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr
                  key={ad.id}
                  className="border-b last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {ad.title}
                  </td>
                  <td className="px-6 py-4">{ad.billing_type || '-'}</td>
                  <td className="px-6 py-4">{ad.placement || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${ad.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}
                    >
                      {ad.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ad.budget ? `$${ad.budget}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(ad)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(ad)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {ads.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No advertisements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Advertisement</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Priority Score</Label>
              <Input
                type="number"
                value={formData.priority_score}
                onChange={(e) =>
                  setFormData({ ...formData, priority_score: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={saveAd}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] w-[95vw] bg-white">
          <DialogHeader>
            <DialogTitle>Delete Advertisement</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">
              Are you sure you want to delete this advertisement? This action
              cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteAd}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
