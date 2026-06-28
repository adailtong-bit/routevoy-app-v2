import { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Store } from 'lucide-react'
import { toast } from 'sonner'
import { AdvancedCompanyForm } from '@/components/admin/hierarchy/AdvancedCompanyForm'
import { useLanguage } from '@/stores/LanguageContext'

export function FranchiseeMerchantsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<any | null>(null)

  const fetchMerchants = async () => {
    if (!franchiseId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('franchise_id', franchiseId)

    if (error) {
      toast.error(
        t('franchisee.management.merchant_load_error') + error.message,
      )
    } else {
      setMerchants(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMerchants()
  }, [franchiseId])

  const handleOpenDialog = (merchant?: any) => {
    if (merchant) {
      setEditingMerchant(merchant)
    } else {
      setEditingMerchant(null)
    }
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('franchisee.management.delete_merchant_confirm')))
      return
    try {
      const { error } = await supabase.from('merchants').delete().eq('id', id)
      if (error) throw error
      toast.success(t('franchisee.management.merchant_deleted'))
      fetchMerchants()
    } catch (err: any) {
      toast.error(
        t('franchisee.management.merchant_delete_error') + err.message,
      )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />{' '}
              {t('franchisee.management.merchants_title')}
            </CardTitle>
            <CardDescription>
              {t('franchisee.management.merchants_desc')}
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('franchisee.management.new_merchant')}
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('franchisee.management.name')}</TableHead>
                  <TableHead>{t('franchisee.management.email')}</TableHead>
                  <TableHead>{t('franchisee.management.document')}</TableHead>
                  <TableHead>{t('franchisee.management.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('franchisee.management.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {t('franchisee.management.loading')}
                    </TableCell>
                  </TableRow>
                ) : merchants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('franchisee.management.no_merchants')}
                    </TableCell>
                  </TableRow>
                ) : (
                  merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">
                        {merchant.name}
                      </TableCell>
                      <TableCell>{merchant.email}</TableCell>
                      <TableCell>{merchant.tax_id || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            merchant.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {merchant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(merchant)}
                        >
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(merchant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMerchant
                ? t('franchisee.management.edit_merchant')
                : t('franchisee.management.new_merchant')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t('franchisee.management.merchant_form_desc')}
            </DialogDescription>
          </DialogHeader>
          <AdvancedCompanyForm
            initialData={editingMerchant}
            onSave={() => {
              setIsDialogOpen(false)
              fetchMerchants()
            }}
            onCancel={() => setIsDialogOpen(false)}
            defaultType="merchant"
            franchiseId={franchiseId}
            isControlled={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
