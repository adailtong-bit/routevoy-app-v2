import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Edit,
  Trash2,
  Plus,
  Globe,
  RefreshCw,
  Power,
  PowerOff,
  Search,
  ImageOff,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useEnvironment } from '@/hooks/use-environment'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

export function AdminOffersTab() {
  const { t } = useLanguage()
  const [offers, setOffers] = useState<any[]>([])
  const [filteredOffers, setFilteredOffers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { environment } = useEnvironment()

  const fetchOffers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('discovered_promotions')
        .select('*')
        .neq('status', 'pending')
        .eq('environment', environment)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setOffers(data)
        setFilteredOffers(data)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast.error(t('common.error', 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredOffers(offers)
      return
    }
    const q = searchQuery.toLowerCase()
    const filtered = offers.filter(
      (o) =>
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.store_name && o.store_name.toLowerCase().includes(q)) ||
        (o.campaign_name && o.campaign_name.toLowerCase().includes(q)),
    )
    setFilteredOffers(filtered)
  }, [searchQuery, offers])

  const handleToggleStatus = async (offer: any) => {
    const newStatus = offer.status === 'published' ? 'inactive' : 'published'
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: newStatus })
        .eq('id', offer.id)

      if (error) throw error

      toast.success(
        newStatus === 'published'
          ? t('admin.offers.activated', 'Offer activated successfully!')
          : t('admin.offers.inactivated', 'Offer deactivated successfully!'),
      )
      fetchOffers()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error(t('common.error', 'An error occurred'))
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t(
          'admin.offers.confirm_delete',
          'Tem certeza que deseja excluir esta oferta permanentemente?',
        ),
      )
    )
      return
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success(
        t('admin.offers.deleted_success', 'Offer deleted successfully!'),
      )
      fetchOffers()
    } catch (error) {
      console.error('Error deleting offer:', error)
      toast.error(t('admin.offers.delete_error', 'Error deleting offer.'))
    }
  }

  const openEdit = (offer: any) => {
    setSelectedOffer({
      ...offer,
      companyId: offer.company_id,
      storeName: offer.store_name,
      externalUrl: offer.product_link || offer.source_url,
      startDate: offer.start_date ? offer.start_date.split('T')[0] : undefined,
      endDate: offer.end_date ? offer.end_date.split('T')[0] : undefined,
      image: offer.image_url,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {t('admin.offers_management', 'Offers and Campaigns Management')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'admin.offers_management_desc',
              'Create, edit, activate, or deactivate campaigns published on the platform.',
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOffers}>
            <RefreshCw className="w-4 h-4 mr-2" />{' '}
            {t('common.refresh', 'Refresh')}
          </Button>
          <Button
            onClick={() => {
              setSelectedOffer(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />{' '}
            {t('admin.offers.new_campaign', 'New Campaign')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t(
                'admin.offers.search_placeholder',
                'Search by title or store...',
              )}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.offers.offer', 'Offer')}</TableHead>
                    <TableHead>
                      {t('admin.offers.store_category', 'Store / Category')}
                    </TableHead>
                    <TableHead>
                      {t('admin.offers.discount', 'Discount')}
                    </TableHead>
                    <TableHead>
                      {t('admin.offers.created_at', 'Created At')}
                    </TableHead>
                    <TableHead>{t('admin.status', 'Status')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t('admin.offers.no_offers', 'No offers found.')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="max-w-[250px]">
                          <div className="flex items-center gap-3">
                            {offer.image_url ? (
                              <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-100 border shadow-sm">
                                <img
                                  src={offer.image_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded shrink-0 bg-slate-100 flex items-center justify-center border shadow-sm">
                                <ImageOff className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div
                                className="font-semibold truncate"
                                title={offer.title}
                              >
                                {offer.title}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                {offer.product_link ? (
                                  <Globe className="w-3 h-3 text-blue-500" />
                                ) : null}
                                {offer.product_link
                                  ? t('admin.offers.online', 'Online')
                                  : t('admin.offers.physical', 'Physical')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {offer.store_name || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {offer.category ||
                              t('admin.offers.general', 'General')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="font-bold bg-primary/10 text-primary border-primary/20"
                          >
                            {offer.discount ||
                              (offer.discount_percentage
                                ? `${offer.discount_percentage}% OFF`
                                : t('admin.offers.view_offer', 'View Offer'))}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {offer.created_at
                            ? format(new Date(offer.created_at), 'dd/MM/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              offer.status === 'published'
                                ? 'default'
                                : offer.status === 'approved'
                                  ? 'outline'
                                  : 'secondary'
                            }
                            className={
                              offer.status === 'published'
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : ''
                            }
                          >
                            {offer.status === 'published'
                              ? t('admin.offers.published', 'Published')
                              : offer.status === 'inactive'
                                ? t('admin.offers.inactive', 'Inactive')
                                : offer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(offer)}
                              title={
                                offer.status === 'published'
                                  ? t('admin.offers.pause', 'Pause/Deactivate')
                                  : t(
                                      'admin.offers.publish',
                                      'Publish/Activate',
                                    )
                              }
                            >
                              {offer.status === 'published' ? (
                                <PowerOff className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Power className="w-4 h-4 text-emerald-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(offer)}
                              title={t('common.edit', 'Edit')}
                            >
                              <Edit className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(offer.id)}
                              title={t('common.delete', 'Delete')}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {isDialogOpen && (
        <CampaignFormDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) fetchOffers()
          }}
          coupon={selectedOffer}
        />
      )}
    </div>
  )
}
