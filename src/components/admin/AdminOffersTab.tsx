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
  Sparkles,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'
import { useEnvironment } from '@/hooks/use-environment'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AdminOffersTab() {
  const { t } = useLanguage()
  const [offers, setOffers] = useState<any[]>([])
  const [filteredOffers, setFilteredOffers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('active')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { environment } = useEnvironment()

  const fetchOffers = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('discovered_promotions')
        .select('*, affiliate:affiliate_partners(name)')
        .eq('environment', environment)
        .order(viewMode === 'deleted' ? 'updated_at' : 'created_at', {
          ascending: false,
        })

      if (viewMode === 'deleted') {
        query = query.eq('status', 'deleted')
      } else {
        query = query.neq('status', 'pending').neq('status', 'deleted')
      }

      if (startDate) {
        query = query.gte('created_at', `${startDate}T00:00:00Z`)
      }
      if (endDate) {
        query = query.lte('created_at', `${endDate}T23:59:59Z`)
      }

      const { data, error } = await query

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
  }, [viewMode, startDate, endDate])

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

  const handleToggleFeatured = async (offer: any) => {
    const newFeatured = !offer.is_featured
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ is_featured: newFeatured })
        .eq('id', offer.id)

      if (error) throw error

      toast.success(
        newFeatured
          ? t('admin.offers.featured_added', 'Campanha marcada como destaque!')
          : t(
              'admin.offers.featured_removed',
              'Destaque removido da campanha!',
            ),
      )
      fetchOffers()
    } catch (error) {
      console.error('Error toggling featured:', error)
      toast.error(t('common.error', 'An error occurred'))
    }
  }

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

  const handleDelete = async (offer: any) => {
    const isAlreadyDeleted = offer.status === 'deleted'
    if (
      !confirm(
        isAlreadyDeleted
          ? t(
              'admin.offers.confirm_hard_delete',
              'Tem certeza que deseja excluir esta oferta PERMANENTEMENTE?',
            )
          : t(
              'admin.offers.confirm_delete',
              'Tem certeza que deseja arquivar/excluir esta oferta?',
            ),
      )
    )
      return
    try {
      let error
      if (isAlreadyDeleted) {
        const res = await supabase
          .from('discovered_promotions')
          .delete()
          .eq('id', offer.id)
        error = res.error
      } else {
        const res = await supabase
          .from('discovered_promotions')
          .update({ status: 'deleted' })
          .eq('id', offer.id)
        error = res.error

        const { data: userData } = await supabase.auth.getUser()
        await supabase.from('audit_logs').insert({
          action: 'soft_delete',
          entity_type: 'discovered_promotions',
          entity_id: offer.id,
          user_id: userData?.user?.id,
          user_email: userData?.user?.email,
          details: `Promotion softly deleted by admin. Title: ${offer.title}`,
          status: 'success',
        })
      }

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

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <div className="mb-4">
          <TabsList>
            <TabsTrigger value="active">
              {t('admin.offers.active_tab', 'Ativos/Publicados')}
            </TabsTrigger>
            <TabsTrigger value="deleted">
              {t('admin.offers.deleted_tab', 'Auditoria (Excluídos)')}
            </TabsTrigger>
          </TabsList>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
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
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                  title={t('common.start_date', 'Data Inicial')}
                />
                <span className="text-slate-400">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                  title={t('common.end_date', 'Data Final')}
                />
              </div>
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
                        {viewMode === 'deleted'
                          ? t('admin.offers.affiliate', 'Afiliado')
                          : t(
                              'admin.offers.store_category',
                              'Store / Category',
                            )}
                      </TableHead>
                      <TableHead>{t('common.price', 'Preço')}</TableHead>
                      <TableHead>
                        {t('admin.offers.discount', 'Discount')}
                      </TableHead>
                      <TableHead>
                        {viewMode === 'deleted'
                          ? t('admin.offers.deleted_at', 'Data Exclusão')
                          : t('admin.offers.created_at', 'Created At')}
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
                                  {offer.is_featured && (
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none text-[10px] px-1.5 py-0 h-4"
                                    >
                                      <Sparkles className="w-2.5 h-2.5 mr-1" />
                                      {t('admin.offers.featured', 'Destaque')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {viewMode === 'deleted' ? (
                              <div className="font-medium text-slate-700">
                                {offer.affiliate?.name ||
                                  t('common.unknown', 'Desconhecido')}
                              </div>
                            ) : (
                              <>
                                <div className="font-medium">
                                  {offer.store_name || 'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {offer.category ||
                                    t('admin.offers.general', 'General')}
                                </div>
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold">
                                {offer.price ? `$${offer.price}` : '-'}
                              </span>
                              {offer.original_price && (
                                <span className="text-xs text-slate-400 line-through">
                                  ${offer.original_price}
                                </span>
                              )}
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
                            {viewMode === 'deleted'
                              ? offer.updated_at
                                ? format(
                                    new Date(offer.updated_at),
                                    'dd/MM/yyyy HH:mm',
                                  )
                                : '-'
                              : offer.created_at
                                ? format(
                                    new Date(offer.created_at),
                                    'dd/MM/yyyy',
                                  )
                                : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                offer.status === 'published'
                                  ? 'default'
                                  : offer.status === 'approved'
                                    ? 'outline'
                                    : offer.status === 'deleted'
                                      ? 'destructive'
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
                                  : offer.status === 'deleted'
                                    ? t('admin.offers.deleted', 'Excluído')
                                    : offer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {viewMode !== 'deleted' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleStatus(offer)}
                                    title={
                                      offer.status === 'published'
                                        ? t(
                                            'admin.offers.pause',
                                            'Pause/Deactivate',
                                          )
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
                                    onClick={() => handleToggleFeatured(offer)}
                                    title={
                                      offer.is_featured
                                        ? t(
                                            'admin.offers.remove_featured',
                                            'Remover Destaque',
                                          )
                                        : t(
                                            'admin.offers.add_featured',
                                            'Marcar como Destaque',
                                          )
                                    }
                                  >
                                    <Sparkles
                                      className={cn(
                                        'w-4 h-4',
                                        offer.is_featured
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-slate-400',
                                      )}
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEdit(offer)}
                                    title={t('common.edit', 'Edit')}
                                  >
                                    <Edit className="w-4 h-4 text-blue-500" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(offer)}
                                title={
                                  viewMode === 'deleted'
                                    ? t(
                                        'common.delete_permanently',
                                        'Excluir Permanentemente',
                                      )
                                    : t('common.delete', 'Delete')
                                }
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
      </Tabs>

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
