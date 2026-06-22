import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import {
  RefreshCw,
  Download,
  ExternalLink,
  Pencil,
  Power,
  Trash2,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { AffiliatePromotionEditor } from '@/components/affiliate/AffiliatePromotionEditor'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const isValidUUID = (uuid: string | null | undefined) => {
  if (!uuid) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    uuid,
  )
}

export function AffiliateExtractedOffers({
  franchiseId,
  companyId,
  affiliateId,
}: {
  franchiseId: string | null
  companyId: string | null
  affiliateId: string | null
}) {
  const { t } = useLanguage()
  const { hierarchy } = useAuth()
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState<Record<string, boolean>>({})
  const [editingPromotion, setEditingPromotion] = useState<any | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchOffers = async () => {
    setLoading(true)

    // Defensive check to avoid Supabase errors on invalid UUIDs
    if (
      (franchiseId && !isValidUUID(franchiseId)) ||
      (affiliateId && !isValidUUID(affiliateId))
    ) {
      setOffers([])
      setLoading(false)
      return
    }

    let query = supabase
      .from('discovered_promotions')
      .select('*')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    // 'franchise_id' does not exist in discovered_promotions, removed eq('franchise_id', franchiseId)
    if (affiliateId) query = query.eq('affiliate_id', affiliateId)

    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00Z`)
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59Z`)
    }

    const { data, error } = await query
    if (error) {
      toast.error(t('common.error', 'An error occurred'))
    } else {
      setOffers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOffers()
  }, [franchiseId, companyId, affiliateId, startDate, endDate])

  const handleImport = async (offer: any) => {
    setImporting((prev) => ({ ...prev, [offer.id]: true }))
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'approved' })
        .eq('id', offer.id)

      if (error) throw error
      toast.success(t('common.success', 'Success!'))
      fetchOffers()
    } catch (err: any) {
      toast.error(t('common.error', 'An error occurred') + ': ' + err.message)
    } finally {
      setImporting((prev) => ({ ...prev, [offer.id]: false }))
    }
  }

  const handleDelete = async (offer: any) => {
    if (
      !confirm(
        t(
          'affiliate.offers.confirm_delete',
          'Tem certeza que deseja remover esta oferta?',
        ),
      )
    )
      return

    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'deleted' })
        .eq('id', offer.id)

      if (error) throw error
      toast.success(
        t('common.success', 'Oferta removida logicamente com sucesso.'),
      )
      fetchOffers()
    } catch (err: any) {
      toast.error(t('common.error', 'Erro') + ': ' + err.message)
    }
  }

  const handleToggleStatus = async (offer: any) => {
    const isActive =
      offer.status === 'active' ||
      offer.status === 'published' ||
      offer.status === 'approved'
    const newStatus = isActive ? 'inactive' : 'active'

    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: newStatus })
        .eq('id', offer.id)

      if (error) throw error
      toast.success(t('common.success', 'Status atualizado com sucesso.'))
      fetchOffers()
    } catch (err: any) {
      toast.error(t('common.error', 'Erro') + ': ' + err.message)
    }
  }

  const handleSaveEdit = async (data: any) => {
    if (!editingPromotion) return

    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({
          title: data.title,
          description: data.description,
          price: data.price,
          original_price: data.original_price,
          image_url: data.image_url,
          end_date: data.end_date,
        })
        .eq('id', editingPromotion.id)

      if (error) throw error
      toast.success(t('common.success', 'Oferta atualizada com sucesso.'))
      fetchOffers()
      setEditingPromotion(null)
    } catch (err: any) {
      toast.error(t('common.error', 'Erro') + ': ' + err.message)
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {t('affiliate.offers.extracted_title', 'Extracted Offers')}
          </CardTitle>
          <CardDescription>
            {t(
              'affiliate.offers.extracted_desc',
              'View and import offers extracted by the crawler.',
            )}
          </CardDescription>
        </div>
        <Button
          onClick={fetchOffers}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          {t('common.refresh', 'Refresh')}
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
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

        <div className="border rounded-md bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.image', 'Image')}</TableHead>
                <TableHead>{t('common.title', 'Title')}</TableHead>
                <TableHead>{t('common.price', 'Price')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    {t('common.loading', 'Loading...')}
                  </TableCell>
                </TableRow>
              ) : offers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    {t(
                      'affiliate.offers.no_extracted',
                      'No extracted offers found.',
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      {offer.image_url && (
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium line-clamp-1">{offer.title}</p>
                      <span className="text-xs text-slate-500">
                        {offer.store_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold">${offer.price}</span>
                        {offer.original_price && (
                          <span className="text-xs text-slate-400 line-through">
                            ${offer.original_price}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          offer.status === 'approved' ? 'default' : 'secondary'
                        }
                      >
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {offer.product_link && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={offer.product_link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}

                        {(hierarchy.isMaster ||
                          offer.affiliate_id === affiliateId) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPromotion(offer)}
                              title={t('common.edit', 'Edit')}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(offer)}
                              title={t('common.toggle_status', 'Toggle Status')}
                            >
                              <Power
                                className={`w-4 h-4 ${offer.status === 'active' || offer.status === 'published' || offer.status === 'approved' ? 'text-green-500' : 'text-slate-400'}`}
                              />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(offer)}
                              title={t('common.delete', 'Delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {offer.status !== 'approved' &&
                          offer.status !== 'active' &&
                          offer.status !== 'published' && (
                            <Button
                              size="sm"
                              onClick={() => handleImport(offer)}
                              disabled={importing[offer.id]}
                            >
                              {importing[offer.id] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-1" />
                              )}
                              {t('common.import', 'Import')}
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AffiliatePromotionEditor
        isOpen={!!editingPromotion}
        onClose={() => setEditingPromotion(null)}
        promotion={editingPromotion}
        onSave={handleSaveEdit}
      />
    </Card>
  )
}
