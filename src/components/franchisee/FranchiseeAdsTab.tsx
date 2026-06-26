import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Plus, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { useLanguage } from '@/stores/LanguageContext'

export function FranchiseeAdsTab({
  franchiseId,
  isNetwork = false,
}: {
  franchiseId: string
  isNetwork?: boolean
}) {
  const { t } = useLanguage()
  const [ads, setAds] = useState<any[]>([])
  const [advertisers, setAdvertisers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<any | null>(null)

  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const { platformSettings } = useCouponStore()
  const royaltyRate = platformSettings?.franchiseRoyaltyRate || 15

  const fetchAds = async () => {
    setLoading(true)
    let query = supabase
      .from('ad_campaigns')
      .select('*')
      .eq('environment', 'production')

    if (isNetwork) {
      query = query.is('franchise_id', null)
    } else {
      if (!franchiseId) {
        setAds([])
        setLoading(false)
        return
      }
      query = query.eq('franchise_id', franchiseId)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Error loading campaigns: ' + error.message)
    } else {
      setAds(data || [])
    }
    setLoading(false)
  }

  const fetchAdvertisers = async () => {
    if (isNetwork || !franchiseId) return
    const { data } = await supabase
      .from('ad_advertisers')
      .select('id, company_name')

    if (data) {
      setAdvertisers(data)
    }
  }

  useEffect(() => {
    fetchAds()
    fetchAdvertisers()
  }, [franchiseId, isNetwork])

  const filteredAds = ads.filter((a) => {
    if (!searchQuery) return true
    return (
      a.title?.toLowerCase().includes(searchQuery) ||
      a.description?.toLowerCase().includes(searchQuery)
    )
  })

  const totalRevenue = filteredAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const totalRoyalties = totalRevenue * (royaltyRate / 100)

  const handleOpenDialog = (ad?: any) => {
    if (ad) {
      setEditingAd(ad)
    } else {
      setEditingAd(null)
    }
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        t(
          'common.confirm_delete',
          'Are you sure you want to delete this campaign?',
        ),
      )
    )
      return
    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(
        t('common.success_delete', 'Campaign deleted successfully!'),
      )
      fetchAds()
    } catch (err: any) {
      toast.error(
        t('common.error_delete', 'Error deleting campaign: ') + err.message,
      )
    }
  }

  return (
    <div className="space-y-6">
      {!isNetwork && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {t('franchisee.regional_revenue', 'Regional Revenue')}
              </p>
              <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {t('franchisee.royalties_due', 'Royalties Due')} ({royaltyRate}
                %)
              </p>
              <h3 className="text-2xl font-bold">
                ${totalRoyalties.toFixed(2)}
              </h3>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {isNetwork
                ? t(
                    'franchisee.network_campaigns',
                    'Network Advertising Campaigns',
                  )
                : t(
                    'franchisee.regional_campaigns',
                    'Regional Advertising Campaigns',
                  )}
            </CardTitle>
            <CardDescription>
              {isNetwork
                ? t(
                    'franchisee.network_campaigns_desc',
                    'View global advertising campaigns running across the network.',
                  )
                : t(
                    'franchisee.regional_campaigns_desc',
                    'Create and manage advertising campaigns displayed exclusively in your region.',
                  )}
            </CardDescription>
          </div>
          {!isNetwork && (
            <Button
              onClick={() => handleOpenDialog()}
              className="shrink-0 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />{' '}
              {t('common.create_campaign', 'Create Campaign')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.campaign', 'Campaign')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead>{t('common.revenue', 'Revenue')}</TableHead>
                  {!isNetwork && (
                    <TableHead>{t('common.royalties', 'Royalties')}</TableHead>
                  )}
                  {!isNetwork && (
                    <TableHead className="text-right">
                      {t('common.actions', 'Actions')}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isNetwork ? 3 : 5}
                      className="text-center py-8"
                    >
                      {t('common.loading', 'Loading...')}
                    </TableCell>
                  </TableRow>
                ) : filteredAds.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isNetwork ? 3 : 5}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('common.no_campaigns_found', 'No campaigns found.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAds.map((ad) => {
                    const revenue = ad.price || ad.budget || 0
                    const royalties = revenue * (royaltyRate / 100)
                    return (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                ad.image ||
                                ad.image_url ||
                                'https://img.usecurling.com/p/200/100?q=ad'
                              }
                              alt={ad.title}
                              className="w-12 h-8 rounded object-cover"
                            />
                            <span className="font-medium truncate max-w-[150px]">
                              {ad.title || t('common.untitled', 'Untitled')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ad.status === 'active' ? 'default' : 'secondary'
                            }
                            className="capitalize"
                          >
                            {ad.status || t('common.pending', 'Pending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${revenue.toFixed(2)}
                        </TableCell>
                        {!isNetwork && (
                          <TableCell className="font-bold text-orange-600">
                            ${royalties.toFixed(2)}
                          </TableCell>
                        )}
                        {!isNetwork && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(ad)}
                            >
                              <Edit2 className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(ad.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!isNetwork && isDialogOpen && (
        <CampaignFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          franchiseId={franchiseId}
          editData={editingAd}
          onSuccess={() => {
            fetchAds()
            setIsDialogOpen(false)
          }}
        />
      )}
    </div>
  )
}
