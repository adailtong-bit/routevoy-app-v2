import { useState, useEffect, useCallback } from 'react'
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
import { Plus, Edit2, Trash2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdvancedCompanyForm } from '@/components/admin/hierarchy/AdvancedCompanyForm'
import { useLanguage } from '@/stores/LanguageContext'

export function FranchiseeAffiliatesTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAffiliate, setEditingAffiliate] = useState<any | null>(null)

  const fetchAffiliates = useCallback(async () => {
    if (!franchiseId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('affiliate_partners')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(
        t(
          'franchisee.management.affiliate_load_error',
          'Failed to load affiliates',
        ) +
          ': ' +
          error.message,
      )
    } else {
      setAffiliates(data || [])
    }
    setLoading(false)
  }, [franchiseId, t])

  useEffect(() => {
    fetchAffiliates()
  }, [fetchAffiliates])

  const handleOpenDialog = (affiliate?: any) => {
    setEditingAffiliate(affiliate || null)
    setIsDialogOpen(true)
  }

  const handleSave = async (formData: any) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status || 'pending',
        franchise_id: franchiseId,
        tax_id: formData.document || formData.tax_id,
        address_city: formData.addressCity,
        address_state: formData.addressState,
        address_country: formData.country,
        commission_model: formData.commission_model || 'percentage',
        commission_rate: formData.commission_rate ?? 30.0,
      }

      if (editingAffiliate) {
        const { error } = await supabase
          .from('affiliate_partners')
          .update(payload)
          .eq('id', editingAffiliate.id)
        if (error) throw error
        toast.success(
          t('franchisee.management.affiliate_updated', 'Affiliate updated'),
        )
      } else {
        const { error } = await supabase
          .from('affiliate_partners')
          .insert([payload])
        if (error) throw error
        toast.success(
          t('franchisee.management.affiliate_created', 'Affiliate created'),
        )
      }
      setIsDialogOpen(false)
      fetchAffiliates()
    } catch (err: any) {
      toast.error(
        t(
          'franchisee.management.affiliate_save_error',
          'Failed to save affiliate',
        ) +
          ': ' +
          err.message,
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        t(
          'franchisee.management.delete_affiliate_confirm',
          'Are you sure you want to delete this affiliate?',
        ),
      )
    )
      return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(
        t('franchisee.management.affiliate_deleted', 'Affiliate deleted'),
      )
      fetchAffiliates()
    } catch (err: any) {
      toast.error(
        t(
          'franchisee.management.affiliate_delete_error',
          'Failed to delete affiliate',
        ) +
          ': ' +
          err.message,
      )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />{' '}
              {t('franchisee.management.affiliates_title', 'Affiliate Network')}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.management.affiliates_desc',
                'Manage affiliates in your region',
              )}
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('franchisee.management.new_affiliate', 'New Affiliate')}
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('franchisee.management.name', 'Name')}
                  </TableHead>
                  <TableHead>
                    {t('franchisee.management.email', 'Email')}
                  </TableHead>
                  <TableHead>
                    {t('franchisee.management.phone', 'Phone')}
                  </TableHead>
                  <TableHead>
                    {t('franchisee.management.status', 'Status')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('franchisee.management.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {t('franchisee.management.loading', 'Loading...')}
                    </TableCell>
                  </TableRow>
                ) : affiliates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      {t(
                        'franchisee.management.no_affiliates',
                        'No affiliates found',
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  affiliates.map((aff) => (
                    <TableRow key={aff.id}>
                      <TableCell className="font-medium">{aff.name}</TableCell>
                      <TableCell>{aff.email}</TableCell>
                      <TableCell>{aff.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            aff.status === 'active' || aff.status === 'approved'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {aff.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(aff)}
                        >
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(aff.id)}
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
              {editingAffiliate
                ? t('franchisee.management.edit_affiliate', 'Edit Affiliate')
                : t('franchisee.management.new_affiliate', 'New Affiliate')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t(
                'franchisee.management.affiliate_form_desc',
                'Fill in the affiliate details',
              )}
            </DialogDescription>
          </DialogHeader>
          <AdvancedCompanyForm
            initialData={editingAffiliate}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            defaultType="affiliate"
            franchiseId={franchiseId}
            isControlled={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
