import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { CustomerJourneyDialog } from '@/components/vendor/CustomerJourneyDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  CalendarIcon,
  Edit2,
  ExternalLink,
  Megaphone,
  Plus,
  Trash2,
  Smartphone,
  QrCode,
  Globe,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { CouponCard } from '@/components/CouponCard'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function VendorCampaignsTab({
  coupons,
  company,
}: {
  coupons: any[]
  company: any
}) {
  const { formatDate, t } = useLanguage()
  const { deleteCoupon, updateCampaign } = useCouponStore()
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [journeyCoupon, setJourneyCoupon] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'regular' | 'seasonal'>('all')

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCoupon(null)
    setIsDialogOpen(true)
  }

  const handleToggleFeatured = async (coupon: any) => {
    const newFeatured = !coupon.isFeatured
    try {
      if (coupon.id && !coupon.id.toString().includes('.')) {
        const { error } = await supabase
          .from('discovered_promotions')
          .update({ is_featured: newFeatured })
          .eq('id', coupon.id)

        if (error) throw error
      }

      updateCampaign(coupon.id, { isFeatured: newFeatured })
      toast.success(
        newFeatured
          ? t(
              'vendor.campaigns_tab.featured_added',
              'Campanha marcada como destaque!',
            )
          : t(
              'vendor.campaigns_tab.featured_removed',
              'Destaque removido da campanha!',
            ),
      )
    } catch (error) {
      console.error('Error toggling featured:', error)
      toast.error(t('common.error', 'Erro ao alterar o destaque.'))
    }
  }

  const now = new Date()

  const filteredCoupons = useMemo(() => {
    if (!coupons) return []
    return coupons.filter((c) => {
      if (filter === 'seasonal') return c.isSeasonal
      if (filter === 'regular') return !c.isSeasonal
      return true
    })
  }, [coupons, filter])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          {t('dashboard.your_campaigns', 'Your Active Campaigns')}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {coupons && coupons.length > 0 && (
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white">
                <SelectValue
                  placeholder={t(
                    'vendor.campaigns_tab.filter',
                    'Filter by type',
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('vendor.campaigns_tab.filter_all', 'All')}
                </SelectItem>
                <SelectItem value="regular">
                  {t('vendor.campaigns_tab.filter_regular', 'Regular')}
                </SelectItem>
                <SelectItem value="seasonal">
                  {t('vendor.campaigns_tab.filter_seasonal', 'Seasonal')}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          {coupons && coupons.length > 0 && (
            <Button
              onClick={handleCreate}
              className="font-bold shadow-md bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />{' '}
              {t('vendor.campaigns_tab.create', 'Create Campaign')}
            </Button>
          )}
        </div>
      </div>

      {!filteredCoupons || filteredCoupons.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">
            {t('vendor.campaigns_tab.empty_title', 'No campaigns found')}
          </h3>
          <p className="text-slate-500 mt-1 max-w-md mx-auto mb-6">
            {filter === 'all'
              ? t(
                  'vendor.campaigns_tab.empty_desc',
                  'You have not created any campaigns yet. Create your first campaign to attract more customers and increase your sales.',
                )
              : t(
                  'vendor.campaigns_tab.empty_filter_desc',
                  'No campaigns match the selected filter.',
                )}
          </p>
          <Button onClick={handleCreate} className="font-bold shadow-md">
            <Plus className="w-4 h-4 mr-2" />{' '}
            {t('vendor.campaigns_tab.create', 'Create Campaign')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {filteredCoupons.map((coupon) => {
            const isUnlimited = coupon.isUnlimited
            const limit = coupon.totalLimit || coupon.totalAvailable || 100
            const used = coupon.reservedCount || 0
            const progress = isUnlimited
              ? 0
              : Math.min(100, Math.round((used / limit) * 100))

            const startDateStr = coupon.startDate
            const endDateStr = coupon.endDate || coupon.expiryDate

            const startDateObj = startDateStr
              ? new Date(`${startDateStr}T00:00:00`)
              : null
            const endDateObj = endDateStr
              ? new Date(`${endDateStr}T23:59:59`)
              : null

            const isScheduled = !!(startDateObj && now < startDateObj)
            const isExpired = !!(endDateObj && now > endDateObj)
            const isSoldOut = !isUnlimited && used >= limit

            let statusBadge = (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm">
                {t('vendor.campaigns_tab.active', 'Active')}
              </Badge>
            )
            if (isSoldOut) {
              statusBadge = (
                <Badge
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 border-none shadow-sm"
                >
                  {t('vendor.campaigns_tab.sold_out', 'Sold Out')}
                </Badge>
              )
            } else if (isExpired) {
              statusBadge = (
                <Badge variant="secondary" className="shadow-sm">
                  {t('vendor.campaigns_tab.expired', 'Expired')}
                </Badge>
              )
            } else if (isScheduled) {
              statusBadge = (
                <Badge className="bg-blue-500 hover:bg-blue-600 border-none shadow-sm">
                  {t('vendor.campaigns_tab.scheduled', 'Scheduled')}
                </Badge>
              )
            }

            return (
              <Card
                key={coupon.id}
                className="overflow-hidden hover:shadow-md transition-all duration-300 border-slate-200 flex flex-col bg-white"
              >
                <div className="relative h-40 bg-slate-100 shrink-0">
                  {coupon.image && (
                    <img
                      src={coupon.image}
                      alt={coupon.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    {statusBadge}
                    {coupon.isFeatured && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 border-none shadow-sm text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t('vendor.campaigns_tab.featured_badge', 'Destaque')}
                      </Badge>
                    )}
                    {coupon.isSeasonal && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 border-none shadow-sm text-white">
                        {t('vouchers.seasonal_badge', 'Seasonal')}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white line-clamp-1 shadow-sm leading-tight mb-1">
                      {coupon.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {startDateStr && endDateStr
                        ? `${formatDate(startDateStr)} - ${formatDate(endDateStr)}`
                        : endDateStr
                          ? `${t('vendor.campaigns_tab.expires_in', 'Expires in')}: ${formatDate(endDateStr)}`
                          : t('vendor.campaigns_tab.indefinite', 'Indefinite')}
                    </div>
                  </div>
                </div>

                <CardContent className="pt-4 flex-1 flex flex-col gap-4 p-5 pb-3">
                  <div className="flex justify-between items-center text-sm font-medium bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-600">
                      {t('vendor.campaigns_tab.discount', 'Discount:')}
                    </span>
                    <span className="text-primary font-bold text-base">
                      {coupon.discount}
                    </span>
                  </div>

                  <div className="space-y-2.5 mt-auto">
                    <div className="flex justify-between items-end text-sm">
                      <span className="font-semibold text-slate-700">
                        {t('vendor.campaigns_tab.redemptions', 'Redemptions')}
                      </span>
                      <span
                        className={cn(
                          'font-bold text-xs',
                          isSoldOut ? 'text-red-500' : 'text-slate-600',
                        )}
                      >
                        {isUnlimited
                          ? `${used} ${t('vendor.campaigns_tab.utilized', 'utilized')}`
                          : `${used} / ${limit}`}
                      </span>
                    </div>
                    <Progress
                      value={isUnlimited ? 100 : progress}
                      className={cn(
                        'h-2',
                        isSoldOut && '[&>div]:bg-red-500',
                        isUnlimited && '[&>div]:bg-emerald-400',
                      )}
                    />
                  </div>

                  <div className="pt-4 flex flex-col gap-2 border-t border-slate-100 mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setJourneyCoupon(coupon)}
                      className="w-full font-semibold bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      {t('vendor.campaigns_tab.view_journey', 'View Journey')}
                    </Button>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-primary px-2"
                      >
                        <Link to={`/voucher/${coupon.id}`}>
                          <ExternalLink className="h-4 w-4 mr-1.5" />{' '}
                          {t(
                            'vendor.campaigns_tab.view_customer',
                            'View customer',
                          )}
                        </Link>
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleFeatured(coupon)}
                          className={cn(
                            'px-2.5',
                            coupon.isFeatured
                              ? 'text-yellow-600 border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                              : 'text-slate-500 hover:text-slate-700',
                          )}
                          title={t(
                            'vendor.campaigns_tab.toggle_featured',
                            'Alternar Destaque',
                          )}
                        >
                          <Sparkles
                            className={cn(
                              'h-4 w-4',
                              coupon.isFeatured ? 'fill-yellow-600' : '',
                            )}
                          />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                          className="text-slate-600 hover:text-primary hover:bg-primary/5"
                        >
                          <Edit2 className="h-4 w-4 mr-1.5" />{' '}
                          {t('vendor.campaigns_tab.edit', 'Edit')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t(
                                  'vendor.campaigns_tab.delete_title',
                                  'Delete Campaign?',
                                )}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t(
                                  'vendor.campaigns_tab.delete_desc',
                                  'This action cannot be undone. The campaign will be permanently removed and no longer accessible to customers.',
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t('common.cancel', 'Cancel')}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCoupon(coupon.id)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                              >
                                {t(
                                  'vendor.campaigns_tab.delete_confirm',
                                  'Delete Campaign',
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    className="w-full border-t border-slate-100 mt-2"
                  >
                    <AccordionItem value="details" className="border-none">
                      <AccordionTrigger className="py-3 text-sm text-primary hover:no-underline font-semibold rounded-lg">
                        {t(
                          'vendor.campaigns_tab.expand_details',
                          'View Campaign Details',
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 space-y-6">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-slate-700">
                            {t(
                              'vendor.campaigns_tab.desc_title',
                              'Campaign Description',
                            )}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {coupon.description}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-slate-700">
                            {t('vendor.campaigns_tab.validity', 'Validity')}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {startDateStr ? formatDate(startDateStr) : 'N/A'}{' '}
                            {t('common.to', 'to')}{' '}
                            {endDateStr ? formatDate(endDateStr) : 'N/A'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-slate-700">
                            {t(
                              'vendor.campaigns_tab.preview_title',
                              'Voucher Preview',
                            )}
                          </h4>
                          <div className="max-w-[280px] pointer-events-none ring-1 ring-slate-200 rounded-xl overflow-hidden mx-auto bg-white shadow-sm">
                            <CouponCard coupon={coupon} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-slate-700">
                            {t(
                              'vendor.campaigns_tab.redemption_title',
                              'Redemption Interface',
                            )}
                          </h4>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center">
                            {coupon.offerType === 'online' ? (
                              <div className="text-center space-y-2">
                                <Globe className="w-6 h-6 text-primary mx-auto" />
                                <p className="text-xs text-slate-600 font-medium">
                                  {t(
                                    'vendor.campaigns_tab.redemption_online',
                                    'Redemption via Online Link / Promo Code',
                                  )}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center space-y-2">
                                <QrCode className="w-6 h-6 text-primary mx-auto" />
                                <p className="text-xs text-slate-600 font-medium">
                                  {t(
                                    'vendor.campaigns_tab.redemption_qr',
                                    'Physical POS Validation via QR Code',
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CampaignFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={company?.id}
        coupon={editingCoupon}
      />

      <CustomerJourneyDialog
        coupon={journeyCoupon}
        open={!!journeyCoupon}
        onOpenChange={(o: boolean) => !o && setJourneyCoupon(null)}
      />
    </div>
  )
}
