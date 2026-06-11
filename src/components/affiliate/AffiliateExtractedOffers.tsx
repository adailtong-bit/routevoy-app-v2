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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PromotionModal } from '@/components/admin/PromotionModal'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { logAudit } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'
import { Check, Edit, Trash2 } from 'lucide-react'

export function AffiliateExtractedOffers({
  franchiseId,
  affiliateId,
}: {
  franchiseId: string | null
  affiliateId: string | null
}) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedPromo, setSelectedPromo] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('discovered_promotions')
        .select('*')
        .eq('status', statusFilter)
        .order('captured_at', { ascending: false })

      if (franchiseId) {
        query = query.eq('franchise_id', franchiseId)
      } else if (affiliateId) {
        query = query.eq('reward_id', affiliateId)
      }

      const { data, error } = await query
      if (error) throw error
      setPromotions(data || [])
    } catch (err: any) {
      toast.error(t('common.error', 'Error fetching offers: ') + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [statusFilter, franchiseId, affiliateId])

  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'approved' })
        .eq('id', id)
      if (error) throw error

      await logAudit(
        'APPROVE',
        'promotion',
        id,
        'Offer approved by affiliate',
        user?.email,
      )
      toast.success(t('common.success', 'Offer approved successfully!'))
      fetchPromotions()
    } catch (err: any) {
      toast.error(t('common.error', 'Erro ao aprovar: ') + err.message)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (
      !confirm(
        t(
          'common.confirm_delete',
          'Are you sure you want to delete this offer?',
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

      await logAudit(
        'DELETE',
        'promotion',
        id,
        'Offer deleted by affiliate',
        user?.email,
      )
      toast.success(t('common.success', 'Offer deleted successfully!'))
      fetchPromotions()
    } catch (err: any) {
      toast.error(t('common.error', 'Erro ao excluir: ') + err.message)
    }
  }

  const handleSavePromo = async (updatedData: any) => {
    if (!selectedPromo) return
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update(updatedData)
        .eq('id', selectedPromo.id)

      if (error) throw error
      toast.success(t('common.success', 'Offer updated successfully!'))
      fetchPromotions()
    } catch (err: any) {
      toast.error(t('common.error', 'Erro ao atualizar: ') + err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {t('affiliate.tabs.extracted_offers', 'Extracted Offers')}
        </h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              {t('common.pending', 'Pending')}
            </SelectItem>
            <SelectItem value="approved">
              {t('admin.offers.published', 'Approved/Published')}
            </SelectItem>
            <SelectItem value="expired">
              {t('admin.invoices.expired', 'Expired')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('affiliate.table.title', 'Title')}</TableHead>
              <TableHead>{t('affiliate.table.store', 'Store')}</TableHead>
              <TableHead>
                {t('affiliate.table.captured_date', 'Captured Date')}
              </TableHead>
              <TableHead>{t('affiliate.table.discount', 'Discount')}</TableHead>
              <TableHead>{t('affiliate.table.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : promotions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  {t(
                    'affiliate.table.no_offers',
                    'No offers found for this status.',
                  )}
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promo) => (
                <TableRow
                  key={promo.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => {
                    setSelectedPromo(promo)
                    setIsModalOpen(true)
                  }}
                >
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {promo.title}
                  </TableCell>
                  <TableCell>
                    {promo.store_name || promo.storeName || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      promo.captured_at || promo.capturedAt || new Date(),
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {promo.discount_percentage
                      ? `${promo.discount_percentage}% OFF`
                      : promo.discount
                        ? promo.discount
                        : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        promo.status === 'approved'
                          ? 'default'
                          : promo.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {promo.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {promo.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 h-8 px-2"
                          onClick={(e) => handleApprove(promo.id, e)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPromo(promo)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-red-500 hover:text-red-700"
                        onClick={(e) => handleDelete(promo.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promotion={selectedPromo}
        onSave={handleSavePromo}
      />
    </div>
  )
}
