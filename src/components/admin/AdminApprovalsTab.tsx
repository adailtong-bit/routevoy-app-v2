import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Store,
  Users,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { PendingApprovalsTab as MerchantApprovals } from '@/components/admin/hierarchy/PendingApprovalsTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AdminApprovalsTab({ franchiseId }: { franchiseId?: string }) {
  const [pendingAffiliates, setPendingAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { companies } = useCouponStore()

  const pendingMerchants = companies.filter(
    (c) =>
      c.status === 'pending' && (!franchiseId || c.franchiseId === franchiseId),
  )

  const fetchPendingAffiliates = async () => {
    try {
      let query = supabase
        .from('affiliate_partners')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (franchiseId) {
        query = query.eq('franchise_id', franchiseId)
      }

      const { data, error } = await query
      if (error) throw error
      setPendingAffiliates(data || [])
    } catch (err: any) {
      console.error('Error fetching pending affiliates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingAffiliates()
  }, [])

  const handleApproveAffiliate = async (affiliate: any) => {
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({ status: 'active' })
        .eq('id', affiliate.id)
      if (error) throw error

      // Disparar e-mail de aprovação
      supabase.functions
        .invoke('send-email', {
          body: {
            type: 'affiliate_approved',
            email: affiliate.email,
            name: affiliate.name,
          },
        })
        .catch(console.error)

      toast.success(
        t(
          'admin.approvals.affiliate_approved_success',
          'Affiliate partner approved successfully!',
        ),
      )
      fetchPendingAffiliates()
    } catch (err: any) {
      toast.error(
        t(
          'admin.approvals.affiliate_approve_error',
          'Error approving affiliate: ',
        ) + err.message,
      )
    }
  }

  const handleRejectAffiliate = async (id: string) => {
    if (
      !confirm(
        t(
          'admin.approvals.confirm_reject',
          'Are you sure you want to reject this affiliate registration?',
        ),
      )
    )
      return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({ status: 'suspended' })
        .eq('id', id)
      if (error) throw error
      toast.success(
        t(
          'admin.approvals.affiliate_rejected',
          'Affiliate registration rejected.',
        ),
      )
      fetchPendingAffiliates()
    } catch (err: any) {
      toast.error(
        t('admin.approvals.reject_error', 'Error rejecting: ') + err.message,
      )
    }
  }

  const { t } = useLanguage()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 flex justify-between">
              {t('admin.approvals.pending_merchants', 'Pending Merchants')}
              <Store className="h-4 w-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {pendingMerchants.length}
            </div>
            <p className="text-xs text-amber-600/80 mt-1">
              {t(
                'admin.approvals.merchants_waiting',
                'Awaiting network validation',
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex justify-between">
              {t('admin.approvals.pending_affiliates', 'Pending Affiliates')}
              <Users className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {pendingAffiliates.length}
            </div>
            <p className="text-xs text-blue-600/80 mt-1">
              {t(
                'admin.approvals.affiliates_waiting',
                'Awaiting document verification',
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800 flex justify-between">
              {t('admin.approvals.total_approvals', 'Total Approvals')}
              <ShieldCheck className="h-4 w-4 text-slate-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {pendingMerchants.length + pendingAffiliates.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('admin.approvals.actions_required', 'Actions required')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="merchants" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="merchants" className="gap-2">
            <Store className="w-4 h-4" />{' '}
            {t('admin.approvals.merchants', 'Merchants')} (
            {pendingMerchants.length})
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="gap-2">
            <Users className="w-4 h-4" />{' '}
            {t('admin.approvals.affiliates', 'Affiliates')} (
            {pendingAffiliates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="merchants">
          <MerchantApprovals franchiseId={franchiseId} />
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t(
                  'admin.approvals.affiliate_approval',
                  'Affiliate Partner Approval',
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.approvals.affiliate_approval_desc',
                  'Review documents (Tax ID) and validate new affiliate registrations before granting access to link generation and payouts.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="p-4 font-medium text-slate-600">
                        {t('admin.approvals.affiliate', 'Affiliate')}
                      </th>
                      <th className="p-4 font-medium text-slate-600">
                        {t('admin.approvals.document', 'Document (Tax ID)')}
                      </th>
                      <th className="p-4 font-medium text-slate-600">
                        {t(
                          'admin.approvals.registration_date',
                          'Registration Date',
                        )}
                      </th>
                      <th className="p-4 font-medium text-slate-600 text-right">
                        {t('common.actions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAffiliates.map((aff) => (
                      <tr
                        key={aff.id}
                        className="border-b hover:bg-slate-50/50"
                      >
                        <td className="p-4 font-medium">
                          {aff.name}
                          <div className="text-xs text-muted-foreground font-normal">
                            {aff.email}
                          </div>
                        </td>
                        <td className="p-4">
                          {aff.tax_id ? (
                            <Badge
                              variant="outline"
                              className="font-mono bg-slate-100"
                            >
                              <FileText className="w-3 h-3 mr-1" /> {aff.tax_id}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">
                              {t('common.not_informed', 'Not informed')}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(aff.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectAffiliate(aff.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />{' '}
                            {t('common.reject', 'Reject')}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveAffiliate(aff)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />{' '}
                            {t('common.approve', 'Approve')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {pendingAffiliates.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-muted-foreground"
                        >
                          {t(
                            'admin.approvals.no_pending_affiliates',
                            'No affiliates awaiting approval at the moment.',
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
