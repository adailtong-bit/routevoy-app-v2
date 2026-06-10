import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import { Wallet, FileText, CheckCircle2, Clock } from 'lucide-react'
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
      if (authUser?.email) {
        const { data: advertiser } = await supabase
          .from('ad_advertisers')
          .select('id')
          .eq('email', authUser.email)
          .maybeSingle()

        if (advertiser) {
          const { data, error } = await supabase
            .from('ad_invoices')
            .select('*')
            .eq('advertiser_id', advertiser.id)
            .order('created_at', { ascending: false })

          if (data && !error) {
            setInvoices(data)
          }
        } else {
          if (company?.id === 'admin-global') {
            const { data } = await supabase
              .from('ad_invoices')
              .select('*')
              .limit(10)
              .order('created_at', { ascending: false })
            if (data) setInvoices(data)
          }
        }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
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
        <Card>
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
