import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Wallet,
  CheckCircle2,
  Clock,
  Eye,
  MousePointerClick,
  History,
  FileText,
  LayoutList,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-16 text-slate-500 border border-dashed rounded-xl bg-slate-50 flex flex-col items-center">
    <FileText className="w-12 h-12 text-slate-300 mb-3" />
    <span className="font-medium text-slate-700">{message}</span>
  </div>
)

export default function MerchantFinance() {
  const { user: authUser, profile } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [campaignStats, setCampaignStats] = useState({
    views: 0,
    clicks: 0,
    engagements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinance = async () => {
      const companyId = profile?.company_id

      if (companyId) {
        const { data: campaigns } = await supabase
          .from('ad_campaigns')
          .select('id, views, clicks')
          .eq('company_id', companyId)

        let totalViews = 0,
          totalClicks = 0,
          totalEngagements = 0
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

        const { data: advertiser } = await supabase
          .from('ad_advertisers')
          .select('id')
          .eq('id', companyId)
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

        const { data } = await invoiceQuery
        if (data) setInvoices(data)
      }
      setLoading(false)
    }

    fetchFinance()
  }, [profile])

  const pendingInvoices = invoices.filter((i) =>
    ['draft', 'pending', 'sent', 'overdue'].includes(i.status),
  )
  const paidInvoices = invoices.filter((i) => i.status === 'paid')

  const InvoiceTable = ({ data }: { data: any[] }) => {
    if (data.length === 0)
      return (
        <EmptyState message="Nenhum registro encontrado nesta categoria." />
      )
    return (
      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
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
            {data.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-slate-800">
                  {invoice.reference_number}
                </TableCell>
                <TableCell className="text-slate-500">
                  {new Date(invoice.issue_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-slate-500">
                  {new Date(invoice.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
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
                <TableCell className="text-right font-bold text-slate-800">
                  R$ {Number(invoice.amount).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
          <Wallet className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Gestão Financeira
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            {profile?.name || 'Visão Consolidada'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100/80 p-1 mb-6 inline-flex h-auto rounded-xl flex-wrap gap-1 w-full sm:w-auto">
          <TabsTrigger
            value="overview"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Faturas
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Histórico
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Pagamentos
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-amber-800 flex items-center justify-between">
                  Pendente <Wallet className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-amber-900">
                  R${' '}
                  {pendingInvoices
                    .reduce((acc, inv) => acc + Number(inv.amount), 0)
                    .toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-emerald-800 flex items-center justify-between">
                  Pago <CheckCircle2 className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-emerald-900">
                  R${' '}
                  {paidInvoices
                    .reduce((acc, inv) => acc + Number(inv.amount), 0)
                    .toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  Total Gasto <LayoutList className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900">
                  R${' '}
                  {invoices
                    .reduce((acc, inv) => acc + Number(inv.amount), 0)
                    .toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="invoices"
          className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2"
        >
          <InvoiceTable data={pendingInvoices} />
        </TabsContent>

        <TabsContent
          value="history"
          className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2"
        >
          <InvoiceTable data={invoices} />
        </TabsContent>

        <TabsContent
          value="payments"
          className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2"
        >
          <EmptyState message="Nenhum método de pagamento configurado no momento." />
        </TabsContent>

        <TabsContent
          value="settings"
          className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2"
        >
          <EmptyState message="Para configurar preferências de faturamento e adicionar contatos para recebimento de faturas, acesse o menu de Configurações da Loja." />
        </TabsContent>
      </Tabs>
    </div>
  )
}
