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
import { RefreshCw, Download, ExternalLink } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

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
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState<Record<string, boolean>>({})

  const fetchOffers = async () => {
    setLoading(true)
    let query = supabase
      .from('discovered_promotions')
      .select('*')
      .order('created_at', { ascending: false })

    if (franchiseId) query = query.eq('franchise_id', franchiseId)
    if (affiliateId) query = query.eq('reward_id', affiliateId)

    const { data, error } = await query
    if (error) {
      toast.error(t('common.error', 'Error fetching offers'))
    } else {
      setOffers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOffers()
  }, [franchiseId, companyId, affiliateId])

  const handleImport = async (offer: any) => {
    setImporting((prev) => ({ ...prev, [offer.id]: true }))
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'approved' })
        .eq('id', offer.id)

      if (error) throw error
      toast.success(t('common.success', 'Offer imported successfully!'))
      fetchOffers()
    } catch (err: any) {
      toast.error(t('common.error', 'Error importing offer: ') + err.message)
    } finally {
      setImporting((prev) => ({ ...prev, [offer.id]: false }))
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
                  <TableCell colSpan={5} className="text-center py-8">
                    {t('common.loading', 'Loading...')}
                  </TableCell>
                </TableRow>
              ) : offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
                        {offer.status !== 'approved' && (
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
    </Card>
  )
}
