import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import {
  Wallet,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  MousePointerClick,
  Share2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCouponStore } from '@/stores/CouponContext'

export default function MerchantFinance() {
  const { t } = useLanguage()
  const { user: authUser, profile } = useAuth()
  const { user, companies } = useCouponStore()

  const [myCompany, setMyCompany] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [campaignStats, setCampaignStats] = useState({
    views: 0,
    clicks: 0,
    engagements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
        return found
      }
      if (authUser?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle()
        if (data) {
          setMyCompany(data)
          return data
        } else if (
          profile?.role === 'admin' ||
          profile?.role === 'super_admin'
        ) {
          const testCompany = {
            id: 'admin-global',
            name: 'Empresa Teste (Visão Admin) - Global',
          }
          setMyCompany(testCompany)
          return testCompany
        }
      }
      return null
    }

    const fetchFinance = async () => {
      const company = await resolveCompany()

      let totalViews = 0
      let totalClicks = 0
      let totalEngagements = 0

      if (company?.id && company.id !== 'admin-global') {
        const { data: campaigns } = await supabase
          .from('ad_campaigns')
          .select('id, views, clicks')
          .eq('company_id', company.id)

        const campaignIds = campaigns?.map((c) => c.id) || []

        if (campaigns) {
          totalViews = campaigns.reduce(
            (acc, curr) => acc + (curr.views || 0),
            0,
          )
          totalClicks = campaigns.reduce(
            (acc, curr) => acc + (curr.clicks || 0),
            0,
          )
        }

        if (campaignIds.length > 0) {
          const { count } = await supabase
            .from('user_engagements')
            .select('id', { count: 'exact', head: true })
            .in('campaign_id', campaignIds)
          totalEngagements = count || 0
        }

        setCampaignStats({
          views: totalViews,
          clicks: totalClicks,
          engagements: totalEngagements,
        })

        if (authUser?.email) {
          const { data: advertiser } = await supabase
            .from('ad_advertisers')
            .select('id')
            .eq('email', authUser.email)
            .maybeSingle()

          let invoiceQuery = supabase
            .from('ad_invoices')
            .select('*')
            .order('created_at', { ascending: false })

          if (advertiser && campaignIds.length > 0) {
            invoiceQuery = invoiceQuery.or(
              `advertiser_id.eq.${advertiser.id},ad_id.in.(${campaignIds.join(',')})`,
            )
          } else if (advertiser) {
            invoiceQuery = invoiceQuery.eq('advertiser_id', advertiser.id)
          } else if (campaignIds.length > 0) {
            invoiceQuery = invoiceQuery.in('ad_id', campaignIds)
          } else {
            invoiceQuery = invoiceQuery.eq(
              'id',
              '00000000-0000-0000-0000-000000000000',
            ) // force empty
          }

          const { data, error } = await invoiceQuery
          if (data && !error) {
            setInvoices(data)
          }
        }
      } else if (company?.id === 'admin-global') {
        const { data: campaigns } = await supabase
          .from('ad_campaigns')
          .select('views, clicks')
        if (campaigns) {
          totalViews = campaigns.reduce(
            (acc, curr) => acc + (curr.views || 0),
            0,
          )
          totalClicks = campaigns.reduce(
            (acc, curr) => acc + (curr.clicks || 0),
            0,
          )
        }
        const { count } = await supabase
          .from('user_engagements')
          .select('id', { count: 'exact', head: true })
        totalEngagements = count || 0

        setCampaignStats({
          views: totalViews,
          clicks: totalClicks,
          engagements: totalEngagements,
        })

        const { data } = await supabase
          .from('ad_invoices')
          .select('*')
          .limit(10)
          .order('created_at', { ascending: false })
        if (data) setInvoices(data)
      }
      setLoading(false)
    }

    fetchFinance()
  }, [companies, user, authUser, profile])

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t('merchant.finance.title', 'Gestão Financeira')}
          </h1>
          <p className="text-slate-500">{myCompany?.name || 'Carregando...'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card className="md:col-span-1 border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Pagas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R${' '}
              {invoices
                .filter((i) => i.status === 'paid')
                .reduce((acc, curr) => acc + Number(curr.amount), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturas Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              R${' '}
              {invoices
                .filter((i) => i.status !== 'paid')
                .reduce((acc, curr) => acc + Number(curr.amount), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Metrics */}
        <Card className="md:col-span-1 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Views
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {campaignStats.views}
            </div>
            <p className="text-xs text-blue-600/80 mt-1">
              Total de visualizações
            </p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1 bg-indigo-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Clicks
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">
              {campaignStats.clicks}
            </div>
            <p className="text-xs text-indigo-600/80 mt-1">Total de cliques</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Engajamentos
            </CardTitle>
            <Share2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {campaignStats.engagements}
            </div>
            <p className="text-xs text-purple-600/80 mt-1">Ações do usuário</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-slate-500" />
            Histórico de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">
              Carregando faturas...
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg bg-slate-50">
              Nenhuma fatura encontrada.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.reference_number}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : invoice.status === 'overdue'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {invoice.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {Number(invoice.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
