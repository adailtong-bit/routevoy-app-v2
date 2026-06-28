import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, PlusCircle, Calendar, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { format } from 'date-fns'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

export function CampaignsManager({
  franchiseId,
  companyId,
  affiliateId,
  onEdit,
}: {
  franchiseId?: string
  companyId?: string
  affiliateId?: string
  onEdit?: (data: any) => void
}) {
  const { t } = useLanguage()
  const { formatCurrency: defaultFormatCurrency } = useRegionFormatting()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [companyId, franchiseId, affiliateId])

  const isValidUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )

  const formatAmount = (
    amount: number | null | undefined,
    campaignCurrency?: string | null,
  ) => {
    if (amount === null || amount === undefined || isNaN(Number(amount)))
      return ''
    const num = Number(amount)
    const curr = campaignCurrency || undefined
    if (curr && ['USD', 'BRL', 'EUR', 'MXN'].includes(curr.toUpperCase())) {
      const localeMap: Record<string, string> = {
        USD: 'en-US',
        BRL: 'pt-BR',
        EUR: 'es-ES',
        MXN: 'es-MX',
      }
      const locale = localeMap[curr.toUpperCase()] || 'pt-BR'
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: curr.toUpperCase(),
        }).format(num)
      } catch {
        return defaultFormatCurrency(num)
      }
    }
    return defaultFormatCurrency(num)
  }

  const buildSpendGetText = (campaign: any) => {
    const amount =
      campaign.trigger_threshold && Number(campaign.trigger_threshold) > 0
        ? Number(campaign.trigger_threshold)
        : campaign.reward_value && Number(campaign.reward_value) > 0
          ? Number(campaign.reward_value)
          : null

    const reward =
      campaign.reward_description ||
      t('campaign_form.fields.model_buy_get', 'Buy and Get')

    if (!amount) return reward

    return t(
      'campaign.spend_get_label',
      'Spend {{amount}} and get {{reward}}',
      {
        amount: formatAmount(amount, campaign.currency),
        reward,
      },
    )
  }

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('ad_campaigns')
        .select('*')
        .eq('environment', 'production')
        .order('created_at', { ascending: false })

      if (companyId) {
        if (isValidUUID(companyId)) {
          query = query.eq('company_id', companyId)
        } else {
          setCampaigns([])
          setLoading(false)
          return
        }
      }
      if (franchiseId) {
        query = query.eq('franchise_id', franchiseId)
      }
      if (affiliateId) {
        if (isValidUUID(affiliateId)) {
          query = query.eq('affiliate_id', affiliateId)
        } else {
          setCampaigns([])
          setLoading(false)
          return
        }
      }

      const { data, error } = await query

      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t(
          'admin.offers.confirm_delete',
          'Are you sure you want to delete this campaign?',
        ),
      )
    )
      return
    try {
      const { error, count } = await supabase
        .from('ad_campaigns')
        .delete({ count: 'exact' })
        .eq('id', id)

      if (error) {
        throw new Error(error.message || 'Error executing delete operation.')
      }

      if (count === 0) {
        throw new Error(
          t(
            'admin.offers.delete_error_permission',
            'Campaign could not be deleted.',
          ),
        )
      }

      toast.success(
        t('admin.offers.deleted_success', 'Campaign deleted successfully'),
      )
      fetchCampaigns()
    } catch (err: any) {
      console.error('Error deleting campaign:', err)
      const errorMsg =
        err.message ||
        t('admin.offers.delete_error', 'Failed to delete campaign')
      toast.error(errorMsg)
    }
  }

  const handleEdit = (campaign: any) => {
    if (onEdit) {
      onEdit(campaign)
    } else {
      setEditingCampaign(campaign)
      setIsSheetOpen(true)
    }
  }

  const handleCreate = () => {
    if (onEdit) {
      onEdit(null)
    } else {
      setEditingCampaign(null)
      setIsSheetOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('admin.ad_manager.campaigns', 'Campaigns')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'merchant.campaigns.desc',
              'Create, manage and track the performance of your offers.',
            )}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          {t('common.create_campaign', 'Create Campaign')}
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-muted-foreground border rounded-xl bg-slate-50/50">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          {t('common.loading', 'Loading...')}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const isSpendGet =
              campaign.promotion_model === 'buy_x_get_y' ||
              campaign.promotion_model === 'buy_and_get' ||
              (campaign.enable_trigger && campaign.trigger_threshold > 0)

            return (
              <div
                key={campaign.id}
                className="border rounded-xl p-5 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[360px]"
              >
                <div className="h-32 -mx-5 -mt-5 mb-4 bg-slate-100 relative shrink-0 border-b overflow-hidden rounded-t-xl">
                  <img
                    src={
                      campaign.image ||
                      'https://img.usecurling.com/p/400/300?q=sale'
                    }
                    alt={campaign.title || 'Campaign'}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'https://img.usecurling.com/p/400/300?q=sale'
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  <Badge
                    variant={
                      campaign.status === 'active' ? 'default' : 'secondary'
                    }
                    className="absolute top-2 left-2 capitalize shadow-sm z-10"
                  >
                    {campaign.status === 'active'
                      ? t('admin.active', 'Active')
                      : campaign.status || 'Active'}
                  </Badge>

                  {isSpendGet ? (
                    <Badge className="absolute bottom-3 right-3 bg-amber-500 text-white hover:bg-amber-600 border-none shadow-md text-xs font-bold px-2 py-1 max-w-[80%] text-center truncate z-10 whitespace-normal leading-tight">
                      🎁 {buildSpendGetText(campaign)}
                    </Badge>
                  ) : campaign.promotion_model === 'fixed_discount' &&
                    campaign.original_price &&
                    campaign.price &&
                    Number(campaign.original_price) > Number(campaign.price) ? (
                    <Badge className="absolute bottom-3 right-3 bg-rose-500 text-white hover:bg-rose-600 border-none shadow-md text-sm font-bold px-2 py-1 z-10">
                      {Math.round(
                        ((Number(campaign.original_price) -
                          Number(campaign.price)) /
                          Number(campaign.original_price)) *
                          100,
                      )}
                      % OFF
                    </Badge>
                  ) : campaign.discount_percentage ? (
                    <Badge className="absolute bottom-3 right-3 bg-rose-500 text-white hover:bg-rose-600 border-none shadow-md text-sm font-bold px-2 py-1 z-10">
                      {campaign.discount_percentage}% OFF
                    </Badge>
                  ) : (
                    <Badge className="absolute bottom-3 right-3 bg-blue-500 text-white hover:bg-blue-600 border-none shadow-md text-sm font-bold px-2 py-1 z-10">
                      {t('marketing.special_offer', 'Special Offer')}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col flex-1">
                  <h3
                    className="font-semibold text-lg line-clamp-1 mb-1"
                    title={campaign.title}
                  >
                    {campaign.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {campaign.description ||
                      t(
                        'merchant.pre_launch.no_desc',
                        'No description provided.',
                      )}
                  </p>

                  <div className="mb-3 mt-auto space-y-1">
                    {isSpendGet ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                          {t('campaign_form.fields.reward', 'Reward')}
                        </span>
                        <span className="text-sm font-bold text-amber-600 leading-tight">
                          {buildSpendGetText(campaign)}
                        </span>
                      </div>
                    ) : campaign.promotion_model === 'pure_discount' ||
                      campaign.promotion_model === 'fixed_discount' ? (
                      <div className="flex items-center gap-2">
                        {campaign.original_price ? (
                          <span className="text-sm line-through text-slate-400">
                            {formatAmount(
                              Number(campaign.original_price),
                              campaign.currency,
                            )}
                          </span>
                        ) : null}
                        {campaign.price !== null &&
                        campaign.price !== undefined ? (
                          <span className="text-lg font-bold text-emerald-600">
                            {formatAmount(
                              Number(campaign.price),
                              campaign.currency,
                            )}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {campaign.discount_percentage ? (
                          <span className="inline-flex items-center text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-md shadow-sm">
                            <Tag className="w-3 h-3 mr-1.5" />
                            {campaign.discount_percentage}% OFF
                          </span>
                        ) : campaign.price !== null &&
                          campaign.price !== undefined &&
                          Number(campaign.price) > 0 ? (
                          <span className="text-lg font-bold text-emerald-600">
                            {formatAmount(
                              Number(campaign.price),
                              campaign.currency,
                            )}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-blue-600">
                            {t('marketing.special_offer', 'Special Offer')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-2">
                    {(campaign.start_date || campaign.end_date) && (
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {campaign.start_date
                          ? format(new Date(campaign.start_date), 'MMM d, yyyy')
                          : '...'}{' '}
                        -
                        {campaign.end_date
                          ? format(new Date(campaign.end_date), 'MMM d, yyyy')
                          : '...'}
                      </div>
                    )}
                    {campaign.category && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-semibold text-slate-600 bg-slate-50"
                      >
                        {t('category.' + campaign.category, campaign.category)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                      {campaign.views || 0} {t('common.views', 'views')}
                    </span>
                    {campaign.budget !== null &&
                      campaign.budget !== undefined && (
                        <span className="text-xs font-bold text-emerald-600">
                          {t('ads.budget', 'Budget')}:{' '}
                          {formatAmount(
                            Number(campaign.budget),
                            campaign.currency,
                          )}
                        </span>
                      )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(campaign)}
                      className="h-8 px-2.5"
                    >
                      <Edit className="w-4 h-4 mr-1.5" />{' '}
                      {t('common.edit', 'Edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(campaign.id)}
                      className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
          {campaigns.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-slate-50/50">
              <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <PlusCircle className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                {t('merchant.campaigns.empty_title', 'No campaigns found')}
              </h3>
              <p className="text-slate-500 mb-4 max-w-sm mx-auto">
                {t(
                  'merchant.campaigns.empty_desc',
                  'Create your first campaign to start reaching more customers.',
                )}
              </p>
              <Button onClick={handleCreate}>
                {t('common.create_campaign', 'Create Campaign')}
              </Button>
            </div>
          )}
        </div>
      )}

      {!onEdit && (
        <CampaignFormDialog
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          franchiseId={franchiseId}
          companyId={companyId}
          affiliateId={affiliateId}
          onSuccess={fetchCampaigns}
          editData={editingCampaign}
        />
      )}
    </div>
  )
}
