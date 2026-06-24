import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { Button } from '@/components/ui/button'
import { Plus, Search, Tag, MapPin, Calendar, Edit2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function MerchantOffers() {
  const { t } = useLanguage()
  const { profile } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCampaigns = async () => {
    if (!profile?.company_id) {
      setLoading(false)
      return
    }

    const companyId = profile.company_id

    // Prevent 22P02 invalid UUID error by checking if company_id is a valid UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(companyId)) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select(
          `
          *,
          ad_advertisers (
            company_name
          )
        `,
        )
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error: any) {
      console.error('Error fetching campaigns:', error)
      toast.error('Error fetching campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [profile?.company_id])

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (campaign: any) => {
    setSelectedCampaign(campaign)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedCampaign(null)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaigns</h1>
          <p className="text-slate-500 text-sm">
            Manage your promotional campaigns and offers
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full max-w-md">
        <Search className="w-5 h-5 text-slate-400" />
        <Input
          className="border-0 p-0 h-auto focus-visible:ring-0 shadow-none text-sm"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No campaigns found
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            You don't have any active campaigns yet. Create your first campaign
            to start attracting customers.
          </p>
          <Button onClick={handleCreate} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="aspect-video relative bg-slate-100 border-b border-slate-100">
                {campaign.image ? (
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge
                    variant={
                      campaign.status === 'active' ? 'default' : 'secondary'
                    }
                    className="shadow-sm"
                  >
                    {campaign.status}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="font-semibold text-slate-900 text-lg line-clamp-1">
                    {campaign.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-normal px-1.5 py-0"
                    >
                      {campaign.category || 'General'}
                    </Badge>
                    {campaign.ad_advertisers?.company_name && (
                      <>
                        <span>•</span>
                        <span
                          className="truncate max-w-[120px]"
                          title={campaign.ad_advertisers.company_name}
                        >
                          {campaign.ad_advertisers.company_name}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="font-medium text-primary">
                      {campaign.promotion_model === 'standard' &&
                      campaign.discount_percentage
                        ? `${campaign.discount_percentage}% OFF`
                        : ''}
                      {campaign.promotion_model === 'buy_and_get'
                        ? 'Buy & Get'
                        : ''}
                      {campaign.promotion_model === 'fixed_discount'
                        ? 'Fixed Discount'
                        : ''}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {campaign.description || 'No description provided.'}
                </p>

                <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
                  {campaign.location_name && (
                    <div className="flex items-center text-xs text-slate-600 gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{campaign.location_name}</span>
                    </div>
                  )}
                  {(campaign.start_date || campaign.end_date) && (
                    <div className="flex items-center text-xs text-slate-600 gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {campaign.start_date
                          ? formatDate(campaign.start_date)
                          : 'Now'}
                        {' - '}
                        {campaign.end_date
                          ? formatDate(campaign.end_date)
                          : 'Ongoing'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(campaign)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CampaignFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        companyId={profile?.company_id}
        franchiseId={profile?.franchise_id}
        editData={selectedCampaign}
        onSuccess={fetchCampaigns}
      />
    </div>
  )
}
